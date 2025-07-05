// clientUplod.js: Handles upload form logic and file parsing
console.log('[clientUplod.js] Loaded');
import { uploadCharacterFile } from 'chummer-viewer/public/client.js';

export function initUploadForm({ sectionContent, characterInput, fileName, onUpload }) {
  console.log('[clientUplod.js] initUploadForm called');
  const uploadForm = document.getElementById('uploadForm');
  if (!uploadForm) return;

  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = characterInput.files[0];
    if (!file) {
      sectionContent.innerHTML = '<div style="color:#e74c3c">Please select a file to upload.</div>';
      return;
    }
    try {
      console.log('[clientUplod.js] Uploading file:', file.name);
      const characterData = await uploadCharacterFile(file);
      console.log('[clientUplod.js] Upload successful:', characterData);
      if (onUpload) await onUpload(characterData);
    } catch (err) {
      console.error('[clientUplod.js] Upload error:', err);
      sectionContent.innerHTML = '<div style="color:#e74c3c">Network or server error.</div>';
    }
    //await onUpload(file);
  });

  characterInput.addEventListener('change', () => {
    fileName.textContent = characterInput.files.length ? characterInput.files[0].name : '';
  });
}
