export const mockData = {
  racks: [
    // ========== RACK A01: Voll bestückt – für UC 1 (Soll/Ist) und UC 2 (Verkabelung) ==========
    {
      id: 'RACK-A01',
      name: 'Rack A01',
      location: 'RZ Frankfurt, Raum 2.03, Reihe A',
      totalUnits: 42,
      devices: [
        {
          id: 'DEV-001',
          name: 'sw-core-01',
          manufacturer: 'Cisco',
          model: 'Nexus 9300',
          formFactor: '1U',
          position: 42,
          height: 1,
          status: 'aktiv',
          plannedStatus: 'aktiv',
          ports: [
            { id: 'PORT-001', name: 'Gi0/1', type: 'SFP+', connectedTo: 'PORT-020', cableId: 'K-2024-0001', status: 'verbunden', plannedStatus: 'verbunden' },
            { id: 'PORT-002', name: 'Gi0/2', type: 'SFP+', connectedTo: 'PORT-021', cableId: 'K-2024-0002', status: 'verbunden', plannedStatus: 'verbunden' },
            { id: 'PORT-003', name: 'Gi0/3', type: 'SFP+', connectedTo: 'PORT-030', cableId: 'K-2024-0003', status: 'verbunden', plannedStatus: 'verbunden' },
            { id: 'PORT-004', name: 'Gi0/4', type: 'SFP+', connectedTo: 'PORT-040', cableId: 'K-2024-0004', status: 'verbunden', plannedStatus: 'verbunden' },
          ]
        },
        {
          id: 'DEV-002',
          name: 'pp-01',
          manufacturer: 'Telegärtner',
          model: 'Patchpanel 24-Port Cat6a',
          formFactor: '1U',
          position: 41,
          height: 1,
          status: 'aktiv',
          plannedStatus: 'aktiv',
          ports: [
            { id: 'PORT-020', name: 'PP-01/1', type: 'RJ45', connectedTo: 'PORT-001', cableId: 'K-2024-0001', status: 'verbunden', plannedStatus: 'verbunden' },
            { id: 'PORT-021', name: 'PP-01/2', type: 'RJ45', connectedTo: 'PORT-002', cableId: 'K-2024-0002', status: 'verbunden', plannedStatus: 'verbunden' },
            { id: 'PORT-022', name: 'PP-01/3', type: 'RJ45', connectedTo: 'PORT-050', cableId: 'K-2024-0005', status: 'verbunden', plannedStatus: 'verbunden' },
            { id: 'PORT-023', name: 'PP-01/4', type: 'RJ45', connectedTo: 'PORT-051', cableId: 'K-2024-0006', status: 'verbunden', plannedStatus: 'verbunden' },
            { id: 'PORT-024', name: 'PP-01/5', type: 'RJ45', connectedTo: 'PORT-060', cableId: 'K-2024-0007', status: 'verbunden', plannedStatus: 'verbunden' },
            { id: 'PORT-025', name: 'PP-01/6', type: 'RJ45', connectedTo: 'PORT-061', cableId: 'K-2024-0008', status: 'verbunden', plannedStatus: 'verbunden' },
          ]
        },
        {
          id: 'DEV-003',
          name: 'srv-web-01',
          manufacturer: 'Dell',
          model: 'PowerEdge R750',
          formFactor: '2U',
          position: 39,
          height: 2,
          status: 'aktiv',
          plannedStatus: 'aktiv',
          ports: [
            { id: 'PORT-030', name: 'eth0', type: 'RJ45', connectedTo: 'PORT-003', cableId: 'K-2024-0003', status: 'verbunden', plannedStatus: 'verbunden' },
            { id: 'PORT-031', name: 'eth1', type: 'RJ45', connectedTo: null, cableId: null, status: 'nicht verbunden', plannedStatus: 'nicht verbunden' },
            { id: 'PORT-032', name: 'iLO', type: 'RJ45', connectedTo: 'PORT-022', cableId: 'K-2024-0005', status: 'verbunden', plannedStatus: 'verbunden' },
          ]
        },
        {
          id: 'DEV-004',
          name: 'srv-web-02',
          manufacturer: 'Dell',
          model: 'PowerEdge R750',
          formFactor: '2U',
          position: 37,
          height: 2,
          status: 'aktiv',
          plannedStatus: 'aktiv',
          ports: [
            { id: 'PORT-040', name: 'eth0', type: 'RJ45', connectedTo: 'PORT-004', cableId: 'K-2024-0004', status: 'verbunden', plannedStatus: 'verbunden' },
            { id: 'PORT-041', name: 'eth1', type: 'RJ45', connectedTo: null, cableId: null, status: 'nicht verbunden', plannedStatus: 'nicht verbunden' },
            { id: 'PORT-042', name: 'iLO', type: 'RJ45', connectedTo: 'PORT-023', cableId: 'K-2024-0006', status: 'verbunden', plannedStatus: 'verbunden' },
          ]
        },
        {
          id: 'DEV-005',
          name: 'srv-db-01',
          manufacturer: 'HPE',
          model: 'ProLiant DL380 Gen10',
          formFactor: '2U',
          position: 35,
          height: 2,
          status: 'aktiv',
          plannedStatus: 'aktiv',
          ports: [
            { id: 'PORT-050', name: 'eth0', type: 'RJ45', connectedTo: 'PORT-022', cableId: 'K-2024-0005', status: 'verbunden', plannedStatus: 'verbunden' },
            { id: 'PORT-051', name: 'eth1', type: 'RJ45', connectedTo: 'PORT-023', cableId: 'K-2024-0006', status: 'verbunden', plannedStatus: 'verbunden' },
            { id: 'PORT-052', name: 'iLO', type: 'RJ45', connectedTo: 'PORT-024', cableId: 'K-2024-0007', status: 'verbunden', plannedStatus: 'verbunden' },
          ]
        },
        {
          id: 'DEV-006',
          name: 'srv-db-02',
          manufacturer: 'HPE',
          model: 'ProLiant DL380 Gen10',
          formFactor: '2U',
          position: 33,
          height: 2,
          status: 'aktiv',
          plannedStatus: 'aktiv',
          ports: [
            { id: 'PORT-060', name: 'eth0', type: 'RJ45', connectedTo: 'PORT-024', cableId: 'K-2024-0007', status: 'verbunden', plannedStatus: 'verbunden' },
            { id: 'PORT-061', name: 'eth1', type: 'RJ45', connectedTo: 'PORT-025', cableId: 'K-2024-0008', status: 'verbunden', plannedStatus: 'verbunden' },
          ]
        },
        {
          id: 'DEV-007',
          name: 'srv-app-01',
          manufacturer: 'Lenovo',
          model: 'ThinkSystem SR650',
          formFactor: '2U',
          position: 31,
          height: 2,
          status: 'aktiv',
          plannedStatus: 'aktiv',
          ports: [
            { id: 'PORT-070', name: 'eth0', type: 'RJ45', connectedTo: 'PORT-082', cableId: 'K-2024-0009', status: 'verbunden', plannedStatus: 'verbunden' },
          ]
        },
        {
          id: 'DEV-008',
          name: 'san-switch-01',
          manufacturer: 'Brocade',
          model: 'G620',
          formFactor: '1U',
          position: 29,
          height: 1,
          status: 'aktiv',
          plannedStatus: 'aktiv',
          ports: [
            { id: 'PORT-080', name: 'FC0/1', type: 'SFP+', connectedTo: 'PORT-090', cableId: 'K-2024-0010', status: 'verbunden', plannedStatus: 'verbunden' },
            { id: 'PORT-081', name: 'FC0/2', type: 'SFP+', connectedTo: 'PORT-091', cableId: 'K-2024-0011', status: 'verbunden', plannedStatus: 'verbunden' },
            { id: 'PORT-082', name: 'Mgmt', type: 'RJ45', connectedTo: 'PORT-070', cableId: 'K-2024-0009', status: 'verbunden', plannedStatus: 'verbunden' },
          ]
        },
        {
          id: 'DEV-009',
          name: 'storage-01',
          manufacturer: 'NetApp',
          model: 'FAS8700',
          formFactor: '4U',
          position: 25,
          height: 4,
          status: 'aktiv',
          plannedStatus: 'aktiv',
          ports: [
            { id: 'PORT-090', name: 'FC-A', type: 'SFP+', connectedTo: 'PORT-080', cableId: 'K-2024-0010', status: 'verbunden', plannedStatus: 'verbunden' },
            { id: 'PORT-091', name: 'FC-B', type: 'SFP+', connectedTo: 'PORT-081', cableId: 'K-2024-0011', status: 'verbunden', plannedStatus: 'verbunden' },
            { id: 'PORT-092', name: 'Mgmt', type: 'RJ45', connectedTo: null, cableId: null, status: 'nicht verbunden', plannedStatus: 'verbunden' },
          ]
        },
        {
          id: 'DEV-010',
          name: 'ups-01',
          manufacturer: 'APC',
          model: 'Smart-UPS SRT 5000VA',
          formFactor: '3U',
          position: 3,
          height: 3,
          status: 'aktiv',
          plannedStatus: 'aktiv',
          ports: []
        },
        {
          id: 'DEV-011',
          name: 'pdu-01',
          manufacturer: 'Raritan',
          model: 'PX3-5902V',
          formFactor: '0U',
          position: 0,
          height: 0,
          status: 'aktiv',
          plannedStatus: 'aktiv',
          ports: [
            { id: 'PORT-110', name: 'Mgmt', type: 'RJ45', connectedTo: null, cableId: null, status: 'nicht verbunden', plannedStatus: 'verbunden' },
          ]
        },
      ]
    },

    // ========== RACK A02: Teilweise bestückt mit Abweichungen – für UC 2, UC 3 ==========
    {
      id: 'RACK-A02',
      name: 'Rack A02',
      location: 'RZ Frankfurt, Raum 2.03, Reihe A',
      totalUnits: 42,
      devices: [
        {
          id: 'DEV-020',
          name: 'sw-access-01',
          manufacturer: 'Cisco',
          model: 'Catalyst 9300',
          formFactor: '1U',
          position: 42,
          height: 1,
          status: 'aktiv',
          plannedStatus: 'aktiv',
          ports: [
            { id: 'PORT-200', name: 'Gi1/0/1', type: 'RJ45', connectedTo: 'PORT-210', cableId: 'K-2024-0012', status: 'verbunden', plannedStatus: 'verbunden' },
            { id: 'PORT-201', name: 'Gi1/0/2', type: 'RJ45', connectedTo: 'PORT-220', cableId: 'K-2024-0013', status: 'verbunden', plannedStatus: 'verbunden' },
            { id: 'PORT-202', name: 'Gi1/0/3', type: 'RJ45', connectedTo: 'PORT-230', cableId: 'K-2024-0014', status: 'verbunden', plannedStatus: 'verbunden' },
            { id: 'PORT-203', name: 'Gi1/0/4', type: 'RJ45', connectedTo: 'PORT-240', cableId: 'K-2024-0015', status: 'verbunden', plannedStatus: 'verbunden' },
            // ABWEICHUNG: Port 5 sollte verbunden sein, ist aber nicht
            { id: 'PORT-204', name: 'Gi1/0/5', type: 'RJ45', connectedTo: null, cableId: null, status: 'nicht verbunden', plannedStatus: 'verbunden' },
          ]
        },
        {
          id: 'DEV-021',
          name: 'pp-02',
          manufacturer: 'Telegärtner',
          model: 'Patchpanel 24-Port Cat6a',
          formFactor: '1U',
          position: 41,
          height: 1,
          status: 'aktiv',
          plannedStatus: 'aktiv',
          ports: [
            { id: 'PORT-210', name: 'PP-02/1', type: 'RJ45', connectedTo: 'PORT-200', cableId: 'K-2024-0012', status: 'verbunden', plannedStatus: 'verbunden' },
            { id: 'PORT-211', name: 'PP-02/2', type: 'RJ45', connectedTo: 'PORT-250', cableId: 'K-2024-0016', status: 'verbunden', plannedStatus: 'verbunden' },
            { id: 'PORT-212', name: 'PP-02/3', type: 'RJ45', connectedTo: 'PORT-251', cableId: 'K-2024-0017', status: 'verbunden', plannedStatus: 'verbunden' },
            { id: 'PORT-213', name: 'PP-02/4', type: 'RJ45', connectedTo: 'PORT-260', cableId: 'K-2024-0018', status: 'verbunden', plannedStatus: 'verbunden' },
          ]
        },
        {
          id: 'DEV-022',
          name: 'srv-mail-01',
          manufacturer: 'Dell',
          model: 'PowerEdge R650',
          formFactor: '1U',
          position: 40,
          height: 1,
          status: 'aktiv',
          plannedStatus: 'aktiv',
          ports: [
            { id: 'PORT-220', name: 'eth0', type: 'RJ45', connectedTo: 'PORT-201', cableId: 'K-2024-0013', status: 'verbunden', plannedStatus: 'verbunden' },
            // ABWEICHUNG: Falscher Port – sollte an PORT-212 angeschlossen sein
            { id: 'PORT-221', name: 'eth1', type: 'RJ45', connectedTo: 'PORT-213', cableId: 'K-2024-0019', status: 'verbunden', plannedStatus: 'verbunden' },
          ]
        },
        {
          id: 'DEV-023',
          name: 'srv-file-01',
          manufacturer: 'Dell',
          model: 'PowerEdge R750',
          formFactor: '2U',
          position: 38,
          height: 2,
          status: 'aktiv',
          plannedStatus: 'aktiv',
          ports: [
            { id: 'PORT-230', name: 'eth0', type: 'RJ45', connectedTo: 'PORT-202', cableId: 'K-2024-0014', status: 'verbunden', plannedStatus: 'verbunden' },
            { id: 'PORT-231', name: 'eth1', type: 'RJ45', connectedTo: 'PORT-211', cableId: 'K-2024-0020', status: 'verbunden', plannedStatus: 'verbunden' },
          ]
        },
        // ABWEICHUNG: Dieses Gerät existiert real, ist aber im Plan nicht vorgesehen
        {
          id: 'DEV-024',
          name: 'srv-test-01',
          manufacturer: 'Supermicro',
          model: 'SYS-1029U',
          formFactor: '1U',
          position: 36,
          height: 1,
          status: 'aktiv',
          plannedStatus: 'nicht vorhanden',
          ports: [
            { id: 'PORT-240', name: 'eth0', type: 'RJ45', connectedTo: 'PORT-203', cableId: 'K-2024-0015', status: 'verbunden', plannedStatus: 'nicht verbunden' },
          ]
        },
        {
          id: 'DEV-025',
          name: 'srv-backup-01',
          manufacturer: 'HPE',
          model: 'ProLiant DL360 Gen10',
          formFactor: '1U',
          position: 35,
          height: 1,
          status: 'aktiv',
          plannedStatus: 'aktiv',
          ports: [
            { id: 'PORT-250', name: 'eth0', type: 'RJ45', connectedTo: 'PORT-211', cableId: 'K-2024-0016', status: 'verbunden', plannedStatus: 'verbunden' },
            { id: 'PORT-251', name: 'eth1', type: 'RJ45', connectedTo: 'PORT-212', cableId: 'K-2024-0017', status: 'verbunden', plannedStatus: 'verbunden' },
          ]
        },
        {
          id: 'DEV-026',
          name: 'fw-01',
          manufacturer: 'Fortinet',
          model: 'FortiGate 200F',
          formFactor: '1U',
          position: 34,
          height: 1,
          // ABWEICHUNG: Falsches Modell – geplant war FortiGate 400F
          status: 'aktiv',
          plannedStatus: 'aktiv',
          plannedModel: 'FortiGate 400F',
          ports: [
            { id: 'PORT-260', name: 'wan1', type: 'RJ45', connectedTo: 'PORT-213', cableId: 'K-2024-0018', status: 'verbunden', plannedStatus: 'verbunden' },
            { id: 'PORT-261', name: 'wan2', type: 'RJ45', connectedTo: null, cableId: null, status: 'nicht verbunden', plannedStatus: 'verbunden' },
          ]
        },
        {
          id: 'DEV-027',
          name: 'ups-02',
          manufacturer: 'APC',
          model: 'Smart-UPS SRT 3000VA',
          formFactor: '2U',
          position: 2,
          height: 2,
          status: 'aktiv',
          plannedStatus: 'aktiv',
          ports: []
        },
      ]
    },

    // ========== RACK A03: Leer mit Planungsstand – für UC 5 (Planungsmodus) ==========
    {
      id: 'RACK-A03',
      name: 'Rack A03',
      location: 'RZ Frankfurt, Raum 2.03, Reihe A',
      totalUnits: 42,
      devices: [
        {
          id: 'DEV-030',
          name: 'sw-dist-01',
          manufacturer: 'Cisco',
          model: 'Nexus 5672UP',
          formFactor: '1U',
          position: 42,
          height: 1,
          status: 'geplant',
          plannedStatus: 'geplant',
          ports: [
            { id: 'PORT-300', name: 'Gi0/1', type: 'SFP+', connectedTo: null, cableId: null, status: 'nicht verbunden', plannedStatus: 'verbunden' },
            { id: 'PORT-301', name: 'Gi0/2', type: 'SFP+', connectedTo: null, cableId: null, status: 'nicht verbunden', plannedStatus: 'verbunden' },
          ]
        },
        {
          id: 'DEV-031',
          name: 'pp-03',
          manufacturer: 'Telegärtner',
          model: 'Patchpanel 48-Port Cat6a',
          formFactor: '2U',
          position: 40,
          height: 2,
          status: 'geplant',
          plannedStatus: 'geplant',
          ports: [
            { id: 'PORT-310', name: 'PP-03/1', type: 'RJ45', connectedTo: null, cableId: null, status: 'nicht verbunden', plannedStatus: 'verbunden' },
            { id: 'PORT-311', name: 'PP-03/2', type: 'RJ45', connectedTo: null, cableId: null, status: 'nicht verbunden', plannedStatus: 'verbunden' },
          ]
        },
        {
          id: 'DEV-032',
          name: 'srv-k8s-node-01',
          manufacturer: 'Dell',
          model: 'PowerEdge R750xa',
          formFactor: '2U',
          position: 38,
          height: 2,
          status: 'geplant',
          plannedStatus: 'geplant',
          ports: [
            { id: 'PORT-320', name: 'eth0', type: 'RJ45', connectedTo: null, cableId: null, status: 'nicht verbunden', plannedStatus: 'verbunden' },
            { id: 'PORT-321', name: 'eth1', type: 'RJ45', connectedTo: null, cableId: null, status: 'nicht verbunden', plannedStatus: 'verbunden' },
            { id: 'PORT-322', name: 'iDRAC', type: 'RJ45', connectedTo: null, cableId: null, status: 'nicht verbunden', plannedStatus: 'verbunden' },
          ]
        },
        {
          id: 'DEV-033',
          name: 'srv-k8s-node-02',
          manufacturer: 'Dell',
          model: 'PowerEdge R750xa',
          formFactor: '2U',
          position: 36,
          height: 2,
          status: 'geplant',
          plannedStatus: 'geplant',
          ports: [
            { id: 'PORT-330', name: 'eth0', type: 'RJ45', connectedTo: null, cableId: null, status: 'nicht verbunden', plannedStatus: 'verbunden' },
            { id: 'PORT-331', name: 'eth1', type: 'RJ45', connectedTo: null, cableId: null, status: 'nicht verbunden', plannedStatus: 'verbunden' },
            { id: 'PORT-332', name: 'iDRAC', type: 'RJ45', connectedTo: null, cableId: null, status: 'nicht verbunden', plannedStatus: 'verbunden' },
          ]
        },
        {
          id: 'DEV-034',
          name: 'srv-k8s-node-03',
          manufacturer: 'Dell',
          model: 'PowerEdge R750xa',
          formFactor: '2U',
          position: 34,
          height: 2,
          status: 'geplant',
          plannedStatus: 'geplant',
          ports: [
            { id: 'PORT-340', name: 'eth0', type: 'RJ45', connectedTo: null, cableId: null, status: 'nicht verbunden', plannedStatus: 'verbunden' },
            { id: 'PORT-341', name: 'eth1', type: 'RJ45', connectedTo: null, cableId: null, status: 'nicht verbunden', plannedStatus: 'verbunden' },
          ]
        },
        {
          id: 'DEV-035',
          name: 'srv-k8s-master-01',
          manufacturer: 'Dell',
          model: 'PowerEdge R650',
          formFactor: '1U',
          position: 32,
          height: 1,
          status: 'geplant',
          plannedStatus: 'geplant',
          ports: [
            { id: 'PORT-350', name: 'eth0', type: 'RJ45', connectedTo: null, cableId: null, status: 'nicht verbunden', plannedStatus: 'verbunden' },
          ]
        },
        {
          id: 'DEV-036',
          name: 'storage-02',
          manufacturer: 'NetApp',
          model: 'AFF A250',
          formFactor: '2U',
          position: 30,
          height: 2,
          status: 'geplant',
          plannedStatus: 'geplant',
          ports: [
            { id: 'PORT-360', name: 'e0a', type: 'SFP+', connectedTo: null, cableId: null, status: 'nicht verbunden', plannedStatus: 'verbunden' },
            { id: 'PORT-361', name: 'e0b', type: 'SFP+', connectedTo: null, cableId: null, status: 'nicht verbunden', plannedStatus: 'verbunden' },
          ]
        },
        {
          id: 'DEV-037',
          name: 'ups-03',
          manufacturer: 'APC',
          model: 'Smart-UPS SRT 5000VA',
          formFactor: '3U',
          position: 3,
          height: 3,
          status: 'geplant',
          plannedStatus: 'geplant',
          ports: []
        },
      ]
    },

    // ========== RACK-TEST: Physisches 9-HE-Testrack – für Prototyp-Evaluation ==========
    {
      id: 'RACK-TEST',
      name: 'Test-Rack (9 HE)',
      location: 'Heimlabor – Prototyp-Evaluation',
      totalUnits: 9,
      devices: [
        {
          id: 'TEST-DEV-001',
          name: 'Steckdosenleiste',
          manufacturer: 'Brennenstuhl',
          model: 'Premium-Line 19" 1U',
          formFactor: '1U',
          position: 1,
          height: 1,
          status: 'aktiv',
          plannedStatus: 'aktiv',
          ports: []
        },
        {
          id: 'TEST-DEV-002',
          name: 'Patchpanel 24 Port',
          manufacturer: 'deleyCON',
          model: 'Cat6 24 Port 1U',
          formFactor: '1U',
          position: 2,
          height: 1,
          status: 'aktiv',
          plannedStatus: 'aktiv',
          ports: []
        },
        {
          id: 'TEST-DEV-003',
          name: 'Paketfilter',
          manufacturer: 'Herstellername',
          model: 'Modellbezeichnung',
          formFactor: '1U',
          position: 3,
          height: 1,
          status: 'aktiv',
          plannedStatus: 'aktiv',
          ports: []
        },
        // ABWEICHUNG: Switch ist auf HE 5 geplant, steht physisch aber auf HE 4
        // HE 4 hat in den Mock-Daten KEINEN Eintrag → wird als "unerwartet" erkannt
        // HE 5 hat diesen Eintrag → wird als "fehlt" erkannt
        {
          id: 'TEST-DEV-004',
          name: 'Switch 24 Port',
          manufacturer: 'Herstellername',
          model: 'Modellbezeichnung',
          formFactor: '1U',
          position: 5,
          height: 1,
          status: 'geplant',
          plannedStatus: 'aktiv',
          ports: []
        },
      ]
    }
  ],

  cables: [
    // Rack A01 Kabel
    { id: 'K-2024-0001', label: 'K-2024-0001-1m', length: '1m', sourcePort: 'PORT-001', targetPort: 'PORT-020', type: 'DAC SFP+' },
    { id: 'K-2024-0002', label: 'K-2024-0002-1m', length: '1m', sourcePort: 'PORT-002', targetPort: 'PORT-021', type: 'DAC SFP+' },
    { id: 'K-2024-0003', label: 'K-2024-0003-3m', length: '3m', sourcePort: 'PORT-003', targetPort: 'PORT-030', type: 'Cat6a' },
    { id: 'K-2024-0004', label: 'K-2024-0004-3m', length: '3m', sourcePort: 'PORT-004', targetPort: 'PORT-040', type: 'Cat6a' },
    { id: 'K-2024-0005', label: 'K-2024-0005-2m', length: '2m', sourcePort: 'PORT-022', targetPort: 'PORT-050', type: 'Cat6a' },
    { id: 'K-2024-0006', label: 'K-2024-0006-2m', length: '2m', sourcePort: 'PORT-023', targetPort: 'PORT-051', type: 'Cat6a' },
    { id: 'K-2024-0007', label: 'K-2024-0007-3m', length: '3m', sourcePort: 'PORT-024', targetPort: 'PORT-060', type: 'Cat6a' },
    { id: 'K-2024-0008', label: 'K-2024-0008-3m', length: '3m', sourcePort: 'PORT-025', targetPort: 'PORT-061', type: 'Cat6a' },
    { id: 'K-2024-0009', label: 'K-2024-0009-1m', length: '1m', sourcePort: 'PORT-070', targetPort: 'PORT-082', type: 'Cat6a' },
    { id: 'K-2024-0010', label: 'K-2024-0010-2m', length: '2m', sourcePort: 'PORT-080', targetPort: 'PORT-090', type: 'LC-LC OM4' },
    { id: 'K-2024-0011', label: 'K-2024-0011-2m', length: '2m', sourcePort: 'PORT-081', targetPort: 'PORT-091', type: 'LC-LC OM4' },

    // Rack A02 Kabel
    { id: 'K-2024-0012', label: 'K-2024-0012-1m', length: '1m', sourcePort: 'PORT-200', targetPort: 'PORT-210', type: 'Cat6a' },
    { id: 'K-2024-0013', label: 'K-2024-0013-2m', length: '2m', sourcePort: 'PORT-201', targetPort: 'PORT-220', type: 'Cat6a' },
    { id: 'K-2024-0014', label: 'K-2024-0014-3m', length: '3m', sourcePort: 'PORT-202', targetPort: 'PORT-230', type: 'Cat6a' },
    { id: 'K-2024-0015', label: 'K-2024-0015-3m', length: '3m', sourcePort: 'PORT-203', targetPort: 'PORT-240', type: 'Cat6a' },
    { id: 'K-2024-0016', label: 'K-2024-0016-2m', length: '2m', sourcePort: 'PORT-211', targetPort: 'PORT-250', type: 'Cat6a' },
    { id: 'K-2024-0017', label: 'K-2024-0017-2m', length: '2m', sourcePort: 'PORT-212', targetPort: 'PORT-251', type: 'Cat6a' },
    { id: 'K-2024-0018', label: 'K-2024-0018-2m', length: '2m', sourcePort: 'PORT-213', targetPort: 'PORT-260', type: 'Cat6a' },
    { id: 'K-2024-0019', label: 'K-2024-0019-1m', length: '1m', sourcePort: 'PORT-221', targetPort: 'PORT-213', type: 'Cat6a' },
    { id: 'K-2024-0020', label: 'K-2024-0020-3m', length: '3m', sourcePort: 'PORT-231', targetPort: 'PORT-211', type: 'Cat6a' },
  ]
}
