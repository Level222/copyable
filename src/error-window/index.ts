import './style.css';

const errorArea = document.getElementById('error');

if (!errorArea) {
  throw new TypeError('Failed to find element #error.');
}

const searchParams = new URLSearchParams(location.search);
const error = searchParams.get('error');

errorArea.textContent = error ?? '"error" query is not specified.';
