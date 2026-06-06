import 'dotenv/config';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first'); // force IPv4

const baseUrl = process.env.TRUSTANCHOR_API_URL;
const apiKey = process.env.TRUSTANCHOR_API_KEY;
const url = `${baseUrl}/api/agent/verify`;

console.log('URL:', url);
console.log('API Key exists:', !!apiKey);

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