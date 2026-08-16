function getApiHost() {
  const runtimeHost = globalThis.__APP_CONFIG__?.apiHost;
  if (typeof runtimeHost === 'string' && runtimeHost.trim()) {
    return runtimeHost.replace(/\/$/, '');
  }

  const envHost = import.meta.env.API_HOST;
  if (typeof envHost === 'string' && envHost.trim()) {
    return envHost.replace(/\/$/, '');
  }

  return 'http://127.0.0.1:3333';
}

function getBase() {
  return `${getApiHost()}/person`;
}

async function request(path = '', options = {}) {
  const { headers, ...rest } = options;
  const res = await fetch(`${getBase()}${path}`, {
    headers: {
      ...(rest.body ? { 'Content-Type': 'application/json' } : {}),
      ...headers
    },
    ...rest
  });

  if (res.status === 204) return null;

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new Error(data?.error || `Ошибка ${res.status}`);
  }

  return data;
}

export function fetchPeople() {
  return request('');
}

export function createPerson(payload) {
  return request('', { method: 'POST', body: JSON.stringify(payload) });
}

export function updatePerson(id, payload) {
  return request(`/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export function deletePerson(id) {
  return request(`/${id}`, { method: 'DELETE' });
}

export function fromApi(person) {
  return {
    id: person.id,
    firstName: person.firstname ?? '',
    lastName: person.lastname ?? '',
    day: person.day,
    month: person.month,
    year: person.year ?? null,
    comment: person.comment ?? ''
  };
}

export function toPayload(entry) {
  return {
    firstname: entry.firstName.trim(),
    lastname: entry.lastName.trim(),
    day: Number(entry.day),
    month: Number(entry.month),
    year: entry.year ? Number(entry.year) : null,
    comment: entry.comment.trim() || null
  };
}
