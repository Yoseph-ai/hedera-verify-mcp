import 'dotenv/config';
import dns from 'dns';

// Force IPv4 (optional)
dns.setDefaultResultOrder('ipv4first');

const baseUrl = process.env.TRUSTANCHOR_API_URL;
const apiKey = process.env.TRUSTANCHOR_API_KEY;
const url = `${baseUrl}/api/agent/verify`;

console.log('URL:', url);
console.log('API Key length:', apiKey ? apiKey.length : 0);

try {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      apiKey: apiKey
    })
  });
  const data = await res.json();
  console.log('Success:', data);
} catch (err) {
  console.error('Fetch error:', err.message);
  console.error('Cause:', err.cause);
}