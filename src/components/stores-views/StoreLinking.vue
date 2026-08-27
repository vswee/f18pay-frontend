<template>
  <div :class="working ? 'store-management no-click' : 'store-management'">
    <div class="form page" @click.stop="">
      <h1><i class="fas fa-link"></i> Store Linking</h1>
      <p class="help-text">
        Connect one active store with a different currency so invoices can offer both payment options while each store remains separate.
      </p>

      <div v-if="message" class="message" :class="messageType">
        <i :class="messageType === 'success' ? 'fas fa-check-circle' : 'fas fa-info-circle'"></i> {{ message }}
      </div>

      <div v-if="loading" class="form working store-linking-loading" role="status" aria-live="polite">
        <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
        <span>Loading store links</span>
      </div>

      <template v-else-if="currentStore">
        <section class="linked-store-panel">
          <div>
            <span class="help-text">Current store</span>
            <h2>{{ decode(currentStore.store_name) }} <small :class="'badge ' + currentStore.network">{{ currentStore.network.toUpperCase() }}</small></h2>
          </div>
          <div v-if="link" class="linked-store-current">
            <span class="help-text">Linked to</span>
            <strong>{{ decode(link.store_name) }}</strong>
            <small :class="'badge ' + link.network">{{ link.network.toUpperCase() }}</small>
            <button class="btn sec" type="button" @click="removeLink">Remove link</button>
          </div>
          <span v-else class="help-text">No additional payment currency is linked.</span>
        </section>

        <h2 class="section-title">Available stores</h2>
        <div class="store-link-grid">
          <article v-for="candidate in candidates" :key="candidate.store_id_int"
            :class="['store-link-tile', { disabled: !canLink(candidate), selected: candidate.store_id_int === link?.store_id_int }]"
            :title="candidate.is_linked_elsewhere ? 'Remove the other link to be able to link to this store.' : undefined">
            <div class="store-link-heading">
              <div>
                <h3>{{ decode(candidate.store_name) }}</h3>
                <span :class="'badge ' + candidate.network">{{ candidate.network.toUpperCase() }}</span>
              </div>
              <i class="fas fa-link" aria-hidden="true"></i>
            </div>
            <p v-if="candidate.store_id_int === link?.store_id_int" class="link-state">Linked to this store</p>
            <p v-else-if="candidate.is_linked_elsewhere" class="link-state">Already linked to another store</p>
            <p v-else-if="candidate.deleted !== 0" class="link-state">Disabled store</p>
            <p v-else-if="candidate.network === currentStore.network" class="link-state">Same default currency</p>
            <button v-else class="btn" type="button" :disabled="!canLink(candidate)" @click="createLink(candidate)">
              Link this store
            </button>
          </article>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useMainStore } from '@/stores'
import { apiUrl } from '@/utils/api'

const route = useRoute()
const store = useMainStore()
const { stores, user, keyiv, keyivId, fingerprint } = storeToRefs(store)

const loading = ref(true)
const working = ref(false)
const message = ref('')
const messageType = ref('')
const link = ref(null)
const candidates = ref([])

const currentStore = computed(() => (stores.value || []).find((item) => {
  const publicRouteId = `${item.store_id.substring(0, 5)}${item.store_id.substring(item.store_id.length - 5)}`
  return publicRouteId === route.params.storeId10
}))

const decode = (value) => {
  try {
    return decodeURIComponent(decodeURI(value || ''))
  } catch {
    return value || ''
  }
}

const credentials = async () => ({
  username: await store.encrypt({ string: user.value, keyiv: keyiv.value }),
  fingerprint: fingerprint.value,
  keyivId: keyivId.value,
})

const loadLinks = async () => {
  if (!currentStore.value?.store_id) return
  loading.value = true
  message.value = ''
  try {
    const response = await fetch(apiUrl('/store-links'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...(await credentials()), store_id: currentStore.value.store_id }),
    })
    const data = await response.json()
    if (!data.proceed) throw new Error(data.debug || 'Unable to load store links.')
    link.value = data.link || null
    candidates.value = Array.isArray(data.candidates) ? data.candidates : []
  } catch (error) {
    messageType.value = ''
    message.value = error.message || 'Unable to load store links.'
  } finally {
    loading.value = false
  }
}

const canLink = (candidate) => Boolean(currentStore.value && !link.value && candidate.store_id_int !== currentStore.value.store_id_int
  && candidate.deleted === 0 && !candidate.is_linked_elsewhere && candidate.network !== currentStore.value.network)

const createLink = async (candidate) => {
  if (!canLink(candidate)) return
  working.value = true
  message.value = ''
  try {
    const response = await fetch(apiUrl('/store-links-create'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...(await credentials()), store_id: currentStore.value.store_id, linked_store_id: candidate.store_id }),
    })
    const data = await response.json()
    if (!data.proceed) throw new Error(data.debug || 'Unable to link stores.')
    messageType.value = 'success'
    message.value = data.debug || 'Stores linked successfully.'
    await loadLinks()
  } catch (error) {
    messageType.value = ''
    message.value = error.message || 'Unable to link stores.'
  } finally {
    working.value = false
  }
}

const removeLink = async () => {
  if (!link.value || !window.confirm(`Remove the link to ${decode(link.value.store_name)}?`)) return
  working.value = true
  message.value = ''
  try {
    const response = await fetch(apiUrl('/store-links-remove'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...(await credentials()), store_id: currentStore.value.store_id, linked_store_id: link.value.store_id10 }),
    })
    const data = await response.json()
    if (!data.proceed) throw new Error(data.debug || 'Unable to remove store link.')
    messageType.value = 'success'
    message.value = data.debug || 'Store link removed.'
    await loadLinks()
  } catch (error) {
    messageType.value = ''
    message.value = error.message || 'Unable to remove store link.'
  } finally {
    working.value = false
  }
}

watch(currentStore, loadLinks)
onMounted(loadLinks)
</script>

<style lang="scss" scoped>
.store-linking-loading {
  display: flex;
  align-items: center;
  gap: .65rem;
  padding: 1rem;
}

.message.success {
  color: var(--green-2);
}

.linked-store-panel,
.store-link-tile {
  border: 1px solid var(--shadow-20);
  border-radius: 12px;
  padding: 1rem;
}

.linked-store-panel {
  display: block;
  margin: 1.5rem 0;
}

.linked-store-panel h2,
.store-link-tile h3 {
  margin: .35rem 0;
}

.linked-store-current {
  display: flex;
  gap: .55rem .75rem;
  align-items: center;
  width: fit-content;
  max-width: 100%;
  margin-top: .75rem;
  padding: .45rem .65rem;
  border: 1px solid var(--shadow-20);
  border-radius: 10px;
  background: var(--shadow-5);
  flex-wrap: wrap;
}

.linked-store-current .help-text {
  flex: 0 0 auto;
  text-align: left;
}

.linked-store-current strong {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.linked-store-current .badge {
  justify-self: end;
}

.linked-store-current .btn {
  margin: 0;
  padding: .4rem .7rem;
}

.section-title {
  margin-top: 2rem;
}

.store-link-grid {
  display: flex;
  flex-wrap: wrap;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.store-link-tile {
  display: flex;
  flex-direction: column;
  gap: .75rem;
  transition: opacity .2s ease, border-color .2s ease;
}

.store-link-tile.disabled {
  opacity: .55;
}

.store-link-tile.selected {
  border-color: var(--green-2);
}

.store-link-heading {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.store-link-heading > i {
  color: var(--green-2);
}

.link-state {
  margin: 0;
  font-size: .9rem;
  color: var(--grey);
}

.store-link-tile .btn {
  align-self: flex-start;
  margin-top: auto;
}

@media (max-width: 640px) {
  .linked-store-panel {
    display: block;
  }

  .linked-store-current {
    width: 100%;
  }
}
</style>
