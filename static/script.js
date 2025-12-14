const wordInput = document.getElementById('wordInput');
const solveBtn = document.getElementById('solveBtn');
const resultsDiv = document.getElementById('results');


async function solve(word){
if(!word) return;
resultsDiv.innerHTML = '<div class="small">Searching...</div>';
try{
const resp = await fetch(`/api/anagrams?word=${encodeURIComponent(word)}`);
if(!resp.ok){
const err = await resp.json();
resultsDiv.innerHTML = `<div class="small">Error: ${err.error || resp.statusText}</div>`;
return;
}
const j = await resp.json();
renderResults(j);
}catch(e){
resultsDiv.innerHTML = `<div class="small">Network error</div>`;
}
}


function renderResults(data){
const { input, anagrams, count } = data;
if(count === 0){
resultsDiv.innerHTML = `<div class="small">No anagrams found for "${escapeHtml(input)}"</div>`;
return;
}
resultsDiv.innerHTML = `<div class="small">Found ${count} anagram(s) for "${escapeHtml(input)}"</div>` +
'<ul>' + anagrams.map(a => `<li class="result-item">${escapeHtml(a)}</li>`).join('') + '</ul>';
}


function escapeHtml(s){
return s.replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
}


solveBtn.addEventListener('click', ()=> solve(wordInput.value.trim()));
wordInput.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') solve(wordInput.value.trim()); });