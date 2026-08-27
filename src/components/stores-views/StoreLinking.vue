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
        <div class="form-section">
          <h2 class="accordian-trigger" @click="accordianOpen = !accordianOpen">
            Link stores <i :class="accordianOpen ? 'fas fa-caret-down' : 'fas fa-caret-right'"></i>
          </h2>
          <div v-if="accordianOpen" class="accordian-sect">
            <section class="linked-store-panel">
              <div>
                <span class="help-text">Current store</span>
                <h2>{{ decode(currentStore.store_name) }} <small :class="'badge ' + currentStore.network">{{ currentStore.network.toUpperCase() }}</small></h2>
              </div>
              <div v-if="link" class="linked-store-current">
                <span class="linked-store-label">Linked to</span>
                <strong>{{ decode(link.store_name) }}</strong>
                <small :class="'badge ' + link.network">{{ link.network.toUpperCase() }}</small>
                <div class="link-actions">
                  <button class="link-menu-trigger" type="button" aria-label="Linked store options"
                    :aria-expanded="linkMenuOpen" @click.stop="linkMenuOpen = !linkMenuOpen">
                    <i class="fas fa-ellipsis-v" aria-hidden="true"></i>
                  </button>
                  <div v-if="linkMenuOpen" class="link-menu" role="menu">
                    <button type="button" role="menuitem" @click="goToLinkedStore">Go to store</button>
                    <button type="button" role="menuitem" @click="removeLink">Remove link</button>
                  </div>
                </div>
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
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useMainStore } from '@/stores'
import { apiUrl } from '@/utils/api'

const route = useRoute()
const router = useRouter()
const store = useMainStore()
const { stores, user, keyiv, keyivId, fingerprint } = storeToRefs(store)

const loading = ref(true)
const working = ref(false)
const message = ref('')
const messageType = ref('')
const link = ref(null)
const linkMenuOpen = ref(false)
const candidates = ref([])
const accordianOpen = ref(true)

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
    linkMenuOpen.value = false
    candidates.value = Array.isArray(data.candidates) ? data.candidates : []
  } catch (error) {
    messageType.value = ''
    message.value = error.message || 'Unable to load store links.'
  } finally {
    loading.value = false
  }
}

const goToLinkedStore = () => {
  const linkedStore = (stores.value || []).find((item) => String(item.store_id_int) === String(link.value?.store_id_int))
  if (!linkedStore) return
  linkMenuOpen.value = false
  router.push({
    name: 'StoreSummary',
    params: { storeId10: `${linkedStore.store_id.substring(0, 5)}${linkedStore.store_id.substring(linkedStore.store_id.length - 5)}` },
  })
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
  gap: .5rem;
  align-items: center;
  width: min(100%, 420px);
  max-width: 100%;
  box-sizing: border-box;
  margin-top: .75rem;
  padding: .45rem .65rem;
  border: 1px solid var(--shadow-20);
  border-radius: 10px;
  background: var(--shadow-5);
  flex-wrap: nowrap;
}

.linked-store-label {
  flex: 0 0 auto;
  text-align: left;
}

.linked-store-current strong {
  min-width: 0;
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.linked-store-current .badge {
  flex: 0 0 auto;
}

.link-actions {
  position: relative;
  flex: 0 0 auto;
}

.link-menu-trigger {
  display: grid;
  place-items: center;
  width: 1.8rem;
  height: 1.8rem;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.link-menu-trigger:hover,
.link-menu-trigger:focus-visible {
  background: var(--shadow-20);
}

.link-menu {
  position: absolute;
  z-index: 5;
  top: calc(100% + .35rem);
  right: 0;
  display: grid;
  min-width: 140px;
  padding: .3rem;
  border: 1px solid var(--shadow-20);
  border-radius: 8px;
  background: var(--black);
  box-shadow: 0 8px 20px rgba(0, 0, 0, .18);
}

.link-menu button {
  border: 0;
  padding: .55rem .65rem;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
  white-space: nowrap;
}

.link-menu button:hover,
.link-menu button:focus-visible {
  border-radius: 5px;
  background: var(--shadow-20);
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
