const DEMO_FLAG_KEY = 'f18_demo_mode';
const DEMO_THEME_KEY = 'f18_demo_theme';

const now = new Date();
const nowIso = now.toISOString();
const nowEpoch = Math.floor(now.getTime() / 1000);
const currentYear = now.getFullYear();

const encodeSvg = (svg) => `data:image/svg+xml;base64,${btoa(svg)}`;

const makeLogo = (label, colorA, colorB) => {
  const safeLabel = String(label).slice(0, 3).toUpperCase();
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">',
    '<defs>',
    `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${colorA}"/><stop offset="100%" stop-color="${colorB}"/></linearGradient>`,
    '</defs>',
    '<rect width="128" height="128" rx="28" fill="url(#g)"/>',
    '<circle cx="64" cy="64" r="46" fill="rgba(255,255,255,0.08)"/>',
    `<text x="64" y="78" text-anchor="middle" font-family="Rubik, Arial, sans-serif" font-size="42" font-weight="800" letter-spacing="1" fill="#ffffff">${safeLabel}</text>`,
    '</svg>',
  ].join('');

  return encodeSvg(svg);
};

const makeStoreId = (suffix) => `demo-store-${suffix}-flat18-${String(suffix).padStart(2, '0')}`;

export const demoUser = 'studio@northstar.example';
export const demoFingerprint = 'demo-fingerprint-9f7b4';
export const demoKeyivId = '42';
export const demoKeyiv = 'demo-keyiv-2026-06-18';

export const demoStores = [
  {
    store_id: makeStoreId('northstar-btc'),
    store_id_int: '4812',
    store_name: 'North Star Coffee',
    store_logo: makeLogo('NS', '#0ea5e9', '#0f172a'),
    network: 'btc',
    deleted: 0,
    sum: '12.48291045',
    store_colour: '0f172a',
    store_accent_colour: '19d87f',
    text_primary: 'f8fafc',
    text_accent: '0f172a',
    payment_page: '1',
    require_email: '1',
    url: 'https://northstar.example/checkout',
    email: 'finance@northstar.example',
    zpub: '',
    created: '2026-03-14 09:12:00',
  },
  {
    store_id: makeStoreId('aurora-eth'),
    store_id_int: '9367',
    store_name: 'Aurora Merch',
    store_logo: makeLogo('AM', '#7c3aed', '#f59e0b'),
    network: 'eth',
    deleted: 0,
    sum: '8.24000000',
    store_colour: '111827',
    store_accent_colour: 'f59e0b',
    text_primary: 'f9fafb',
    text_accent: '111827',
    payment_page: '1',
    require_email: '0',
    url: 'https://aurora.example/store',
    email: 'hello@aurora.example',
    zpub: '0x7c1a9d3f4d8b7a2c5e60b1d4a9b2c3d4e5f60789',
    created: '2026-02-10 15:45:00',
  },
  {
    store_id: makeStoreId('legacy-btc'),
    store_id_int: '1130',
    store_name: 'Legacy Events',
    store_logo: makeLogo('LE', '#ef4444', '#7c2d12'),
    network: 'btc',
    deleted: 1,
    sum: '0.93840000',
    store_colour: '7c2d12',
    store_accent_colour: 'ef4444',
    text_primary: 'fff7ed',
    text_accent: '111827',
    payment_page: '0',
    require_email: '1',
    url: 'https://legacy.example/events',
    email: 'ops@legacy.example',
    zpub: 'zpub6qxt8DemoLegacyExampleXXXXXXXXXXXXXX',
    created: '2025-11-01 10:30:00',
  },
];

const demoStoreLinks = new Map();
demoStoreLinks.set('4812', '9367');
demoStoreLinks.set('9367', '4812');

export const demoActiveStoreId = demoStores[0].store_id;

export const demoInvoiceValues = [
  { date: `${currentYear} Jan`, count: 8, count2: 10 },
  { date: `${currentYear} Feb`, count: 11, count2: 12 },
  { date: `${currentYear} Mar`, count: 10, count2: 14 },
  { date: `${currentYear} Apr`, count: 13, count2: 15 },
  { date: `${currentYear} May`, count: 17, count2: 19 },
  { date: `${currentYear} Jun`, count: 21, count2: 24 },
];

export const demoInvoiceStatistics = {
  average: { sum: '12.279', count: '6' },
  statuses: [
    { status: 'confirmed', count: '38' },
    { status: 'receiving', count: '5' },
    { status: 'partial', count: '3' },
    { status: 'expired', count: '2' },
  ],
  max: '2.140',
};

const invoiceStatusCycle = [4, 1, 2, 0, 3, 5];
const invoiceStatusLabels = {
  0: 'expired',
  1: 'receiving',
  2: 'partial',
  3: '1 confirmation',
  4: 'confirmed',
  5: '2 confirmations',
};

const buildInvoice = (index) => {
  const status = invoiceStatusCycle[index % invoiceStatusCycle.length];
  const store = demoStores[index % 2];
  const created = new Date(now.getTime() - (index + 1) * 86400000 + (index % 5) * 3600000);
  const invoiceValue = [49.95, 120, 15.5, 89.99, 220, 7.25][index % 6];
  const cryptoValue = [0.00086134, 0.00207291, 0.00026888, 0.00156124, 0.00382516, 0.00012544][index % 6];
  const received = status === 4 ? cryptoValue : status === 1 ? 0 : Number((cryptoValue * (0.28 + (index % 3) * 0.21)).toFixed(8));
  const currency = ['GBP', 'GBP', 'EUR', 'USD', 'GBP', 'EUR'][index % 6];
  const exchange = ['57922.11', '57921.18', '61855.44', '52111.08', '57920.50', '61220.72'][index % 6];

  return {
    id: index + 1,
    invoice_id: `inv_${String(index + 1).padStart(3, '0')}_${store.store_id_int}`,
    created: created.toISOString(),
    invoice_value: invoiceValue.toFixed(2),
    currency,
    exchange,
    status,
    reqToken: index % 2 === 0 ? `req_${String(index + 6).padStart(3, '0')}` : '',
    reqEmail: index % 2 === 0 ? `accounts+${index + 1}@${store.store_name.split(' ')[0].toLowerCase()}.example` : '',
    reqDesc: index % 2 === 0 ? `Order ${index + 1} for ${store.store_name}` : '',
    tx2: `Item ${index + 1} - ${store.store_name}`,
    payee_email: `buyer${index + 1}@example.com`,
    btc_value: cryptoValue.toFixed(8),
    crypto: 'BTC',
    address: `bc1q${String(index + 1).padStart(4, '0')}sampleaddress${store.store_id_int}${String(index + 1).padStart(4, '0')}`.slice(0, 42),
    tx3: received.toFixed ? received.toFixed(8) : String(received),
  };
};

const buildRequest = (index) => {
  const store = demoStores[index % 2];
  const status = invoiceStatusCycle[(index + 1) % invoiceStatusCycle.length];
  const created = new Date(now.getTime() - (index + 2) * 43200000 + (index % 4) * 1800000);
  const value = [18.5, 125, 42, 9.99, 250, 75.25][index % 6];
  const cryptoValue = [0.00031872, 0.00215564, 0.00072412, 0.00017291, 0.00432088, 0.00130105][index % 6];
  const received = status === 4 ? cryptoValue : status === 1 ? 0 : Number((cryptoValue * 0.34).toFixed(8));
  const currency = ['GBP', 'EUR', 'USD', 'GBP', 'EUR', 'USD'][index % 6];

  return {
    token: `payreq_${String(index + 1).padStart(3, '0')}_${store.store_id_int}`,
    created: created.toISOString(),
    invoice_value: value.toFixed(2),
    currency,
    status,
    reqToken: `payreq_${String(index + 1).padStart(3, '0')}`,
    reqEmail: `buyer${index + 1}@example.com`,
    reqDesc: `Invoice request ${index + 1} for ${store.store_name}`,
    tx2: `Request ${index + 1} - ${store.store_name}`,
    payee_email: `buyer${index + 1}@example.com`,
    btc_value: cryptoValue.toFixed(8),
    crypto: 'BTC',
    address: `bc1q${String(index + 1).padStart(4, '0')}requestaddress${store.store_id_int}${String(index + 1).padStart(4, '0')}`.slice(0, 42),
    tx3: received.toFixed ? received.toFixed(8) : String(received),
  };
};

export const demoInvoices = Array.from({ length: 20 }, (_, index) => buildInvoice(index));
export const demoRequests = Array.from({ length: 20 }, (_, index) => buildRequest(index));

export const demoPaymentRequestOptions = {
  descriptions: [
    'Premium support retainer',
    'Monthly marketing invoice',
    'Cafe reopening deposit',
    'Merch order 2406',
    'Event photography balance',
  ],
  emails: [
    'finance@northstar.example',
    'billing@aurora.example',
    'hello@legacy.example',
    'buyer@example.com',
    'accounts@example.com',
  ],
};

export const demoAddressConfirmations = [
  'bc1q8r4r7j7p8l0v6u2n4k9c5m1x3s7a2g4f6d8p0',
  'bc1q6v4k9m2s8d1f3h5j7l0p2r4t6y8u0i2o4p6',
  'bc1q2n4m6v8c0x1z3a5s7d9f1g3h5j7k9l1p3r5',
  'bc1q7m5n3b1v9c7x5z3l1k9j7h5g3f1d9s7a5p3',
  'bc1q5p3o1i9u7y5t3r1e9w7q5a3s1d9f7g5h3j1',
  'bc1q1a3s5d7f9g1h3j5k7l9p1o3i5u7y9t1r3e5',
  'bc1q9z7x5c3v1b9n7m5l3k1j9h7g5f3d1s9a7p5',
  'bc1q3r5t7y9u1i3o5p7a9s1d3f5g7h9j1k3l5p7',
  'bc1q4d6f8g0h2j4k6l8p0o2i4u6y8t0r2e4w6q8',
  'bc1q6p4o2i0u8y6t4r2e0w8q6a4s2d0f8g6h4j2',
];

export const demoKeyDownloadRows = Array.from({ length: 10 }, (_, index) => ({
  private_key: `L1${String(index + 1).padStart(2, '0')}demoPrivateKey${String(index + 1).padStart(2, '0')}XXXXXXXXXXXXXXXX`,
}));

export const demoApiKeys = [
  {
    id: 1,
    nickname: 'btcpayserver',
    keyPrefix: 'f18_demo_9f7b',
    permissions: [
      'btcpay.store.canviewinvoices',
      'btcpay.store.cancreateinvoice',
      'btcpay.store.canmodifyinvoices',
      'btcpay.store.canviewstoresettings',
      'btcpay.store.webhooks.canmodifywebhooks',
      'btcpay.store.cancreatenonapprovedpullpayments',
    ],
    created: '2026-06-18T12:00:00.000Z',
    lastUsed: '2026-06-18T12:30:00.000Z',
    revoked: null,
  },
];

export const demoRouteTitles = {
  dashboard: 'Dashboard',
  account: 'Account Management',
  'account-security': 'Security settings',
  'account-password': 'Change password',
  StoreSummary: 'Store Overview',
  StoreSettings: 'Manage Store',
  WalletSettings: 'Wallet',
  StoreAssets: 'Payment Assets',
  Invoices: 'Invoices',
  PaymentRequest: 'Payment Requests',
};

export const isDemoMode = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.localStorage.getItem(DEMO_FLAG_KEY) === '1';
};

export const activateDemoMode = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  window.localStorage.setItem(DEMO_FLAG_KEY, '1');
  window.localStorage.setItem(DEMO_THEME_KEY, 'dark');

  return true;
};

export const getDemoTheme = () => 'dark';

const jsonResponse = (payload) => new Response(JSON.stringify(payload), {
  headers: {
    'Content-Type': 'application/json',
  },
});

const withStore = (storeId) => demoStores.find((store) => {
  const legacyId = `${store.store_id.substring(0, 5)}${store.store_id.substring(store.store_id.length - 5)}`;
  const publicId = `${store.store_id.substring(0, 4)}${store.store_id_int}${store.store_id.substring(store.store_id.length - 4)}`;
  return legacyId === storeId || publicId === storeId || store.store_id === storeId || String(store.store_id_int) === String(storeId);
}) || demoStores[0];

const publicStoreId = (store) => `${store.store_id.substring(0, 4)}${store.store_id_int}${store.store_id.substring(store.store_id.length - 4)}`;
const demoPublicInvoices = new Map();

const buildDemoPaymentOption = ({ invoiceId, store, invoiceValue, currency }) => {
  const isEth = store.network === 'eth';
  const exchange = isEth ? '3225.14' : '57922.11';
  const crypto = isEth ? 'ETH' : 'BTC';
  const amount = Number((invoiceValue / Number(exchange)).toFixed(8));
  const address = isEth
    ? `0x${store.store_id_int}DemoAddress${String(invoiceValue).replace('.', '')}`.slice(0, 42)
    : `bc1q${store.store_id_int}demoaddress${String(invoiceValue).replace('.', '')}`.slice(0, 42);

  return {
    id: `demo-option-${invoiceId}-${store.store_id_int}`,
    storeId: publicStoreId(store),
    storeName: store.store_name,
    network: store.network,
    crypto,
    currency,
    exchange,
    amount: amount.toFixed(8),
    address,
    fee: isEth ? '0' : '0.00001240',
    status: 1,
    tx3: '',
    storeColour: store.store_colour,
    storeAccentColour: store.store_accent_colour,
    requiresEmail: store.require_email === '1',
  };
};

const buildPublicInvoice = ({ store_id, currency, price, redirectURL, invoice_id }) => {
  const store = withStore(store_id || demoActiveStoreId);
  if (invoice_id && demoPublicInvoices.has(invoice_id)) {
    const existingInvoice = demoPublicInvoices.get(invoice_id);
    return {
      ...existingInvoice,
      redirectURL: redirectURL || existingInvoice.redirectURL,
    };
  }
  const fiat = currency || 'GBP';
  const amount = Number(price || 49.95);
  const exchange = store.network === 'eth' ? '3225.14' : '57922.11';
  const cryptoShortName = store.network === 'eth' ? 'ETH' : 'BTC';
  const cryptoAmount = store.network === 'eth' ? Number((amount / Number(exchange)).toFixed(6)) : Number((amount / Number(exchange)).toFixed(8));
  const invoiceId = invoice_id || `demo-${store.store_id_int}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
  const created = Math.floor(nowEpoch - 180);
  const end = created + 900;

  const linkedId = demoStoreLinks.get(String(store.store_id_int));
  const linkedStore = linkedId ? demoStores.find((candidate) => String(candidate.store_id_int) === String(linkedId)) : null;
  const invoice = {
    invoiceId,
    storeName: store.store_name,
    currencyLongName: cryptoShortName === 'BTC' ? 'Bitcoin' : 'Ethereum',
    currencyShortName: cryptoShortName,
    fiatValue: amount.toFixed(2),
    fiatShortName: fiat,
    cryptoShortName,
    exchange,
    total: cryptoAmount.toFixed(cryptoShortName === 'BTC' ? 8 : 6),
    btc_value: cryptoAmount.toFixed(cryptoShortName === 'BTC' ? 8 : 6),
    crypto: cryptoShortName,
    fee: cryptoShortName === 'BTC' ? '0.00001240' : '0.000420',
    address: cryptoShortName === 'BTC'
      ? `bc1q${store.store_id_int}demoaddress${String(amount).replace('.', '')}`.slice(0, 42)
      : `0x${store.store_id_int}DemoAddress${String(amount).replace('.', '')}`.slice(0, 42),
    qrCode: `${cryptoShortName === 'BTC' ? 'bitcoin' : 'ethereum'}:${cryptoShortName === 'BTC'
      ? `bc1q${store.store_id_int}demoaddress${String(amount).replace('.', '')}`.slice(0, 42)
      : `0x${store.store_id_int}DemoAddress${String(amount).replace('.', '')}`.slice(0, 42)}?amount=${cryptoAmount.toFixed(cryptoShortName === 'BTC' ? 8 : 6)}&label=${encodeURIComponent(store.store_name)}&message=${encodeURIComponent('F18 Pay demo checkout')}`,
    tx2: 'Marketing campaign deposit',
    now: nowEpoch,
    created,
    end,
    store: {
      colour: store.store_colour,
      accent_colour: store.store_accent_colour,
    },
    redirectURL: redirectURL || 'https://flat18.co.uk/thank-you',
    status: 0,
    statusInt: 0,
    requiresEmail: false,
  };

  invoice.paymentOptions = [store, linkedStore]
    .filter(Boolean)
    .map((optionStore) => buildDemoPaymentOption({ invoiceId, store: optionStore, invoiceValue: amount, currency: fiat }));
  demoPublicInvoices.set(invoiceId, invoice);
  return invoice;
};

export const getDemoResponse = async (pathname, body = {}, method = 'GET') => {
  if (pathname === '/store-links') {
    const current = withStore(body.store_id);
    const linkedId = demoStoreLinks.get(String(current.store_id_int));
    const linked = linkedId ? demoStores.find((item) => String(item.store_id_int) === String(linkedId)) : null;
    return jsonResponse({
      proceed: true,
      currentStore: {
        store_id_int: current.store_id_int,
        store_id10: `${current.store_id.substring(0, 4)}${current.store_id_int}${current.store_id.substring(current.store_id.length - 4)}`,
        store_name: current.store_name,
        network: current.network,
      },
      link: linked ? {
        link_id: `demo-link-${current.store_id_int}`,
        store_id_int: linked.store_id_int,
        store_id10: `${linked.store_id.substring(0, 4)}${linked.store_id_int}${linked.store_id.substring(linked.store_id.length - 4)}`,
        store_name: linked.store_name,
        network: linked.network,
        deleted: linked.deleted,
      } : null,
      candidates: demoStores.map((candidate) => {
        const candidateLink = demoStoreLinks.get(String(candidate.store_id_int));
        return {
          store_id_int: candidate.store_id_int,
          store_id: candidate.store_id,
          store_id10: `${candidate.store_id.substring(0, 4)}${candidate.store_id_int}${candidate.store_id.substring(candidate.store_id.length - 4)}`,
          store_name: candidate.store_name,
          network: candidate.network,
          deleted: candidate.deleted,
          is_linked_elsewhere: Boolean(candidateLink && String(candidateLink) !== String(linkedId)),
          linked_to_name: candidateLink ? demoStores.find((item) => String(item.store_id_int) === String(candidateLink))?.store_name || null : null,
        };
      }),
    });
  }

  if (pathname === '/store-links-create') {
    const current = withStore(body.store_id);
    const linked = withStore(body.linked_store_id);
    demoStoreLinks.set(String(current.store_id_int), linked.store_id_int);
    demoStoreLinks.set(String(linked.store_id_int), current.store_id_int);
    return jsonResponse({ proceed: true, debug: 'Stores linked successfully.' });
  }

  if (pathname === '/store-links-remove') {
    const current = withStore(body.store_id);
    const linked = withStore(body.linked_store_id);
    demoStoreLinks.delete(String(current.store_id_int));
    demoStoreLinks.delete(String(linked.store_id_int));
    return jsonResponse({ proceed: true, debug: 'Store link removed.' });
  }

  if (pathname.startsWith('/api/v1/stores/') && pathname.endsWith('/webhooks')) {
    if (method === 'POST') {
      return jsonResponse({
        enabled: true,
        automaticRedelivery: true,
        url: body.url,
        authorizedEvents: body.authorizedEvents || { everything: false, specificEvents: [] },
        id: 'demo-webhook-1',
        secret: 'f18_demo_webhook_secret_7f7b2c1a',
      });
    }

    return jsonResponse([]);
  }

  switch (pathname) {
    case '/get-keyiv':
      return jsonResponse({ keyivId: demoKeyivId, keyiv: demoKeyiv, debug: 'Demo credentials loaded' });

    case '/validate-fingerprint-check-username':
      return jsonResponse({ proceed: true, time: nowIso });

    case '/check-username':
      return jsonResponse({ usernameConfirmed: true });

    case '/check-username-pre-exist':
      return jsonResponse({ usernameConfirmed: true });

    case '/check-username-for-activation':
      return jsonResponse({ usernameConfirmed: true, debug: 'Email Verification Required', route: 'code-verify' });

    case '/check-username-for-password-reset':
      return jsonResponse({ usernameConfirmed: true, debug: 'Email verification not required in demo mode' });

    case '/password-login':
      return jsonResponse({ proceed: true, fingerprint: demoFingerprint });

    case '/register-new-user':
      return jsonResponse({ proceed: true, debug: 'Demo user registration accepted' });

    case '/code-verify':
      return jsonResponse({ proceed: true, fingerprint: demoFingerprint, debug: 'Verification complete' });

    case '/request-new-code':
      return jsonResponse({ proceed: true, debug: 'Code issued' });

    case '/reset-user-pass':
      return jsonResponse({ proceed: true, debug: 'Password reset complete' });

    case '/account-details':
      return jsonResponse({
        proceed: true,
        account: {
          username: 'Studio account',
          email: demoUser,
          emailVerified: true,
          blacklisted: false,
          limited: false,
        },
      });

    case '/account-update':
      return jsonResponse({
        proceed: true,
        account: {
          username: body.displayName || 'Studio account',
          email: demoUser,
          emailVerified: true,
        },
      });

    case '/account-password-request-code':
      return jsonResponse({ proceed: true, debug: 'Verification code sent' });

    case '/account-password-change':
      return jsonResponse({ proceed: true, fingerprint: demoFingerprint, debug: 'Password updated successfully' });

    case '/stores':
      return jsonResponse({
        proceed: true,
        stores: demoStores.map((item) => {
          const linkedId = demoStoreLinks.get(String(item.store_id_int));
          const linked = demoStores.find((candidate) => String(candidate.store_id_int) === String(linkedId));
          return linked ? {
            ...item,
            linked_store_id_int: linked.store_id_int,
            linked_store_name: linked.store_name,
            linked_store_network: linked.network,
            linked_store_id10: `${linked.store_id.substring(0, 4)}${linked.store_id_int}${linked.store_id.substring(linked.store_id.length - 4)}`,
          } : item;
        }),
      });

    case '/store-invoice-values':
      return jsonResponse({ proceed: true, invoiceValues: demoInvoiceValues });

    case '/store-invoice-statistics':
      return jsonResponse({ proceed: true, statistics: JSON.stringify(demoInvoiceStatistics) });

    case '/store-invoices':
      return jsonResponse({ proceed: true, count: 46, invoices: JSON.stringify(demoInvoices), now: nowIso });

    case '/invoice-check-status': {
      const statusByInvoice = body?.status || 0;
      const statusLabel = invoiceStatusLabels[statusByInvoice] || 'partial';
      return jsonResponse({ proceed: true, status: statusLabel });
    }

    case '/store-requests':
      return jsonResponse({ proceed: true, count: 46, requests: JSON.stringify(demoRequests), now: nowIso });

    case '/store-requests-pre-populate':
      return jsonResponse({
        proceed: true,
        'pre-populate': JSON.stringify(demoPaymentRequestOptions),
      });

    case '/store-requests-create-new':
      return jsonResponse({
        proceed: true,
        extra: 'viewAddress',
        address: JSON.stringify('bc1qdemorequestaddressshowcase0001'),
      });

    case '/store-management-request-keys':
      return jsonResponse({ proceed: true, extra: 'confirmCode', debug: 'Demo security check' });

    case '/store-management-request-keys-verify-code':
      return jsonResponse({
        proceed: true,
        extra: 'downloadFile',
        keys: JSON.stringify(demoKeyDownloadRows),
      });

    case '/store-api-keys':
      return jsonResponse({ proceed: true, keys: demoApiKeys });

    case '/store-api-keys-create':
      return jsonResponse({
        proceed: true,
        key: {
          id: 2,
          nickname: body.nickname || 'btcpayserver',
          keyPrefix: 'f18_demo_new1',
          permissions: body.permissions || [],
          created: nowIso,
          secret: 'f18_demo_new_key_7f8d2c1a',
        },
        debug: 'API key created. Copy it now; the full key will not be shown again.',
      });

    case '/store-api-keys-revoke':
      return jsonResponse({ proceed: true, debug: 'API key revoked.' });

    case '/store-settings-bulk':
      return jsonResponse({ proceed: true, currentStore: demoStores[0].store_id });

    case '/store-settings-change-zpub':
      return jsonResponse({ proceed: true, currentStore: demoStores[0].store_id });

    case '/store-settings-confirm-zpub-addresses':
      return jsonResponse({
        proceed: true,
        currentStore: demoStores[0].store_id,
        confirmAddresses: demoAddressConfirmations,
        number: demoAddressConfirmations.length,
      });

    case '/store-settings-async':
      return jsonResponse({ proceed: true, currentStore: demoStores[0].store_id });

    case '/new-store-type-name-check':
      return jsonResponse({ proceed: true, extra: 'zpub', currentStore: demoStores[1].store_id });

    case '/new-store-derivation-internal':
      return jsonResponse({ proceed: true, currentStore: demoStores[0].store_id });

    case '/new-store-query-zpub':
      return jsonResponse({ proceed: true, extra: 'confirm-addresses', confirmAddresses: demoAddressConfirmations });

    case '/new-store-confirm-bitcoin-zpub-addresses-match':
      return jsonResponse({ proceed: true, currentStore: demoStores[0].store_id });

    case '/invoice':
      return jsonResponse({ invoice: buildPublicInvoice(body) });

    case '/invoice-retrieve':
      return jsonResponse({ invoice: buildPublicInvoice(body) });

    case '/invoice-status': {
      const statusInt = body?.invoice_id && String(body.invoice_id).includes('paid') ? 4 : 0;
      return jsonResponse({
        status: 'confirmed',
        statusInt,
        tx3: statusInt >= 2 ? '0.00086134' : false,
      });
    }

    default:
      return null;
  }
};

export const installDemoFetch = () => {
  if (typeof window === 'undefined' || window.__F18_DEMO_FETCH_INSTALLED__) {
    return;
  }

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init) => {
    const urlValue = typeof input === 'string' ? input : input?.url || '';
    let parsedUrl;

    try {
      parsedUrl = new URL(urlValue, window.location.origin);
    } catch {
      return originalFetch(input, init);
    }

    const method = (init?.method || (typeof input !== 'string' && input.method) || 'GET').toUpperCase();
    let body = {};

    if (init?.body) {
      try {
        body = JSON.parse(init.body);
      } catch {
        body = {};
      }
    }

    const mocked = await getDemoResponse(parsedUrl.pathname, body, method);
    if (mocked) {
      return mocked;
    }

    return originalFetch(input, init);
  };

  window.__F18_DEMO_FETCH_INSTALLED__ = true;
};

export const seedDemoDashboardState = (store, route) => {
  if (!store || !route || !route.path || (!route.path.startsWith('/dashboard') && !route.path.startsWith('/account'))) {
    return;
  }

  const activeStore = route.params?.storeId10
    ? demoStores.find((item) => `${item.store_id.substring(0, 5)}${item.store_id.substring(item.store_id.length - 5)}` === route.params.storeId10)
    : demoStores[0];

  store.setTheme('dark');
  store.setUser(demoUser);
  store.setFingerprint(demoFingerprint);
  store.setKeyivId([demoKeyivId, demoKeyiv]);
  store.setSession(true);
  store.setStores(demoStores);
  store.setActiveStore(activeStore?.store_id || demoStores[0].store_id);
  store.setTime(nowIso);
  store.setShowTitle(Boolean(route.name && route.name !== 'dashboard'));
  store.setViewTitle(route.name ? demoRouteTitles[route.name] || 'Dashboard' : 'Dashboard');
  store.setStoreView(route.name || 'overview');
  store.setSidebarCollapse(false);
};

export const shouldUseDemoMode = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.has('demo')) {
    activateDemoMode();
    return true;
  }

  return isDemoMode();
};
