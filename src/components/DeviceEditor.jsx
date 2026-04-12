import { useState, useEffect, useMemo } from 'react'

/**
 * Modal for creating or editing a device in a rack.
 *
 * Validation rules:
 *   - name + height + position required
 *   - position+height must fit inside the rack (1..totalUnits)
 *   - the resulting HE range must not overlap with any other device in the rack
 *     (when editing, the device being edited is excluded from collision check)
 */
export default function DeviceEditor({ rack, device, initialPosition, onSave, onDelete, onCancel }) {
  const isNew = !device

  const [form, setForm] = useState(() => ({
    name: device?.name ?? '',
    manufacturer: device?.manufacturer ?? '',
    model: device?.model ?? '',
    formFactor: device?.formFactor ?? '1U',
    height: device?.height ?? 1,
    position: device?.position ?? initialPosition ?? 1,
    status: device?.status ?? 'aktiv',
    plannedStatus: device?.plannedStatus ?? 'aktiv',
  }))

  // Build occupancy map of all OTHER devices to check collisions against
  const occupiedUnits = useMemo(() => {
    const map = {}
    rack.devices.forEach(d => {
      if (device && d.id === device.id) return
      for (let i = 0; i < d.height; i++) {
        map[d.position + i] = d.name
      }
    })
    return map
  }, [rack.devices, device])

  const error = useMemo(() => {
    if (!form.name.trim()) return 'Name ist erforderlich.'
    const h = Number(form.height)
    const p = Number(form.position)
    if (!Number.isInteger(h) || h < 1) return 'Höhe muss eine ganze Zahl ≥ 1 sein.'
    if (!Number.isInteger(p) || p < 1) return 'Position muss eine ganze Zahl ≥ 1 sein.'
    if (p + h - 1 > rack.totalUnits) {
      return `Gerät passt nicht ins Rack (max. ${rack.totalUnits} HE).`
    }
    for (let i = 0; i < h; i++) {
      const unit = p + i
      if (occupiedUnits[unit]) {
        return `Konflikt auf HE ${unit} (belegt durch "${occupiedUnits[unit]}").`
      }
    }
    return null
  }, [form, occupiedUnits, rack.totalUnits])

  // Auto-derive form factor label from height when user changes height
  useEffect(() => {
    const h = Number(form.height)
    if (Number.isInteger(h) && h >= 1) {
      setForm(prev => ({ ...prev, formFactor: `${h}U` }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.height])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (error) return
    const payload = {
      id: device?.id ?? `DEV-${Date.now().toString(36).toUpperCase()}`,
      name: form.name.trim(),
      manufacturer: form.manufacturer.trim(),
      model: form.model.trim(),
      formFactor: form.formFactor,
      position: Number(form.position),
      height: Number(form.height),
      status: form.status,
      plannedStatus: form.plannedStatus,
      ports: device?.ports ?? [],
    }
    onSave(payload)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-white mb-1">
          {isNew ? 'Gerät hinzufügen' : 'Gerät bearbeiten'}
        </h2>
        <p className="text-xs text-gray-500 mb-5">
          {rack.name} – {rack.location}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Name *">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="z.B. srv-web-01"
              className={inputClass}
              autoFocus
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Hersteller">
              <input
                type="text"
                value={form.manufacturer}
                onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                placeholder="Dell"
                className={inputClass}
              />
            </Field>
            <Field label="Modell">
              <input
                type="text"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                placeholder="PowerEdge R750"
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Höhe (HE) *">
              <input
                type="number"
                min={1}
                max={rack.totalUnits}
                value={form.height}
                onChange={(e) => setForm({ ...form, height: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Position (unterste HE) *">
              <input
                type="number"
                min={1}
                max={rack.totalUnits}
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Status (Ist)">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className={inputClass}
              >
                <option value="aktiv">aktiv</option>
                <option value="geplant">geplant</option>
                <option value="defekt">defekt</option>
              </select>
            </Field>
            <Field label="Status (Soll)">
              <select
                value={form.plannedStatus}
                onChange={(e) => setForm({ ...form, plannedStatus: e.target.value })}
                className={inputClass}
              >
                <option value="aktiv">aktiv</option>
                <option value="geplant">geplant</option>
              </select>
            </Field>
          </div>

          {error && (
            <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">
              {error}
            </div>
          )}

          <div className="flex justify-between gap-2 pt-2">
            <div>
              {!isNew && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Gerät "${device.name}" wirklich löschen?`)) {
                      onDelete(device.id)
                    }
                  }}
                  className="px-3 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg text-sm hover:bg-red-500/20 transition-colors"
                >
                  Löschen
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-2 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg text-sm hover:bg-gray-700 transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={!!error}
                className="px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isNew ? 'Hinzufügen' : 'Speichern'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

const inputClass =
  'w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-500'

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}
