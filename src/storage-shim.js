window.storage = {
    async get(key) {
        const v = localStorage.getItem(key)
        if (v === null) throw new Error('not found')  // az eredeti API is dob
        return { key, value: v, shared: false }
    },
    async set(key, value) {
        localStorage.setItem(key, value)
        return { key, value, shared: false }
    },
    async delete(key) { localStorage.removeItem(key); return { key, deleted: true } },
    async list(prefix = '') {
        return { keys: Object.keys(localStorage).filter(k => k.startsWith(prefix)) }
    }
}