/**
 * my-vocab.js - Stage C personal vocabulary
 * User-curated vocabulary list with optional sharing to community pool
 */

import { AppState, save } from './state.js';
import { savePersonalVocab, loadPersonalVocab, deletePersonalVocab, toggleVocabPoolOptIn } from './database.js';
import { speakArabic } from './utils/audio.js';
import { showError, showToast, showLoading, hideLoading } from './utils/ui.js';

let personalVocab = [];
let viewMode = 'list'; // 'list' or 'study'
let currentStudyIndex = 0;

/**
 * Render My Vocabulary screen
 */
export async function renderMyVocabScreen(container) {
  showLoading('Loading your vocabulary...');
  
  try {
    const { words } = await loadPersonalVocab(AppState.email);
    personalVocab = words;
    hideLoading();
    
    if (viewMode === 'list') {
      renderListView(container);
    } else {
      renderStudyView(container);
    }
  } catch (error) {
    hideLoading();
    showError('Failed to load vocabulary');
    console.error('Load vocab error:', error);
  }
}

/**
 * Render list view
 */
function renderListView(container) {
  const poolOptIn = AppState.profile.vocabPoolOptIn || false;
  
  container.innerHTML = `
    <div class="my-vocab-screen">
      <!-- Header -->
      <div class="vocab-header">
        <button class="btn-back" id="back-btn">← Back</button>
        <h2>My Vocabulary</h2>
      </div>
      
      <!-- Actions -->
      <div class="vocab-actions">
        <button class="btn-primary" id="add-btn">+ Add Word</button>
        <button class="btn-secondary" id="import-btn">Import CSV</button>
        ${personalVocab.length > 0 ? `
          <button class="btn-secondary" id="study-btn">Study Mode</button>
        ` : ''}
      </div>
      <input type="file" id="csv-file-input" accept=".csv" style="display: none;" />
      
      <!-- Pool Opt-in -->
      <div class="vocab-pool-opt-in">
        <label class="toggle-label">
          <input type="checkbox" id="pool-toggle" ${poolOptIn ? 'checked' : ''} />
          <span>Share my words with the community pool</span>
        </label>
        <p class="toggle-description">Help other learners by sharing your vocabulary (anonymous)</p>
      </div>
      
      <!-- Vocabulary List -->
      ${personalVocab.length === 0 ? `
        <div class="empty-state">
          <p>No vocabulary yet</p>
          <p class="empty-hint">Add words you want to remember</p>
        </div>
      ` : `
        <div class="vocab-list">
          ${personalVocab.map((word, index) => `
            <div class="vocab-item">
              <div class="vocab-content">
                <div class="vocab-arabic" dir="rtl">${word.arabic}</div>
                <div class="vocab-english">${word.english}</div>
                ${word.romanization ? `
                  <div class="vocab-romanization">${word.romanization}</div>
                ` : ''}
                ${word.notes ? `
                  <div class="vocab-notes">${word.notes}</div>
                ` : ''}
              </div>
              <div class="vocab-actions-item">
                <button class="audio-btn" data-index="${index}">🔊</button>
                <button class="delete-btn" data-index="${index}">🗑️</button>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
  
  attachListViewListeners(container);
}

/**
 * Attach list view listeners
 */
function attachListViewListeners(container) {
  const backBtn = container.querySelector('#back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      import('./router.js').then(({ navigateTo }) => navigateTo('home'));
    });
  }
  
  const addBtn = container.querySelector('#add-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      renderAddWordForm(container);
    });
  }
  
  const studyBtn = container.querySelector('#study-btn');
  if (studyBtn) {
    studyBtn.addEventListener('click', () => {
      viewMode = 'study';
      currentStudyIndex = 0;
      renderStudyView(container);
    });
  }
  
  const poolToggle = container.querySelector('#pool-toggle');
  if (poolToggle) {
    poolToggle.addEventListener('change', async (e) => {
      try {
        await toggleVocabPoolOptIn(AppState.email, e.target.checked);
        AppState.profile.vocabPoolOptIn = e.target.checked;
        await save();
        showToast(e.target.checked ? 'Sharing enabled' : 'Sharing disabled');
      } catch (error) {
        showError('Failed to update sharing setting');
        console.error('Pool toggle error:', error);
      }
    });
  }
  
  const audioButtons = container.querySelectorAll('.audio-btn');
  audioButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index);
      const word = personalVocab[index];
      speakArabic(word.arabic);
    });
  });
  
  const deleteButtons = container.querySelectorAll('.delete-btn');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const index = parseInt(btn.dataset.index);
      const word = personalVocab[index];
      
      if (confirm(`Delete "${word.english}"?`)) {
        try {
          await deletePersonalVocab(AppState.email, word.id);
          personalVocab.splice(index, 1);
          showToast('Word deleted');
          renderListView(container);
        } catch (error) {
          showError('Failed to delete word');
          console.error('Delete vocab error:', error);
        }
      }
    });
  });
}

/**
 * Render add word form
 */
function renderAddWordForm(container) {
  container.innerHTML = `
    <div class="add-vocab-screen">
      <!-- Header -->
      <div class="add-header">
        <button class="btn-back" id="cancel-btn">✕ Cancel</button>
        <h2>Add Word</h2>
      </div>
      
      <!-- Form -->
      <div class="add-form">
        <div class="form-group">
          <label>Arabic *</label>
          <input type="text" id="arabic-input" class="text-input" dir="rtl" placeholder="كلمة" />
        </div>
        
        <div class="form-group">
          <label>English *</label>
          <input type="text" id="english-input" class="text-input" placeholder="word" />
        </div>
        
        <div class="form-group">
          <label>Romanization (optional)</label>
          <input type="text" id="romanization-input" class="text-input" placeholder="kalima" />
        </div>
        
        <div class="form-group">
          <label>Notes (optional)</label>
          <textarea id="notes-input" class="text-input" rows="3" placeholder="Personal notes or context..."></textarea>
        </div>
        
        <button class="btn-primary" id="save-btn">Save Word</button>
      </div>
    </div>
  `;
  
  attachAddFormListeners(container);
}

/**
 * Attach add form listeners
 */
function attachAddFormListeners(container) {
  const cancelBtn = container.querySelector('#cancel-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      renderListView(container);
    });
  }
  
  const saveBtn = container.querySelector('#save-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const arabic = container.querySelector('#arabic-input').value.trim();
      const english = container.querySelector('#english-input').value.trim();
      const romanization = container.querySelector('#romanization-input').value.trim();
      const notes = container.querySelector('#notes-input').value.trim();
      
      if (!arabic || !english) {
        showError('Arabic and English are required');
        return;
      }
      
      showLoading('Saving word...');
      
      try {
        const newWord = {
          arabic,
          english,
          romanization: romanization || null,
          notes: notes || null,
          createdAt: new Date().toISOString()
        };
        
        const savedWord = await savePersonalVocab(AppState.email, newWord);
        personalVocab.push(savedWord);
        
        hideLoading();
        showToast('Word added!');
        renderListView(container);
      } catch (error) {
        hideLoading();
        showError('Failed to save word');
        console.error('Save vocab error:', error);
      }
    });
  }
}

/**
 * Render study view
 */
function renderStudyView(container) {
  if (personalVocab.length === 0) {
    viewMode = 'list';
    renderListView(container);
    return;
  }
  
  if (currentStudyIndex >= personalVocab.length) {
    completeStudySession(container);
    return;
  }
  
  const word = personalVocab[currentStudyIndex];
  
  container.innerHTML = `
    <div class="vocab-study">
      <!-- Header -->
      <div class="study-header">
        <button class="btn-back" id="exit-btn">✕ Exit</button>
        <div class="study-title">
          <h2>Study Mode</h2>
          <p>Word ${currentStudyIndex + 1} of ${personalVocab.length}</p>
        </div>
      </div>
      
      <!-- Progress -->
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${((currentStudyIndex + 1) / personalVocab.length) * 100}%"></div>
      </div>
      
      <!-- Word Card -->
      <div class="study-card">
        <div class="study-arabic" dir="rtl">
          ${word.arabic}
          <button class="audio-btn" id="audio-btn">🔊</button>
        </div>
        
        ${word.romanization ? `
          <div class="study-romanization">${word.romanization}</div>
        ` : ''}
        
        <div class="study-english">${word.english}</div>
        
        ${word.notes ? `
          <div class="study-notes">${word.notes}</div>
        ` : ''}
      </div>
      
      <!-- Navigation -->
      <div class="study-nav">
        ${currentStudyIndex > 0 ? `
          <button class="btn-secondary" id="prev-btn">← Previous</button>
        ` : '<div></div>'}
        
        ${currentStudyIndex < personalVocab.length - 1 ? `
          <button class="btn-primary" id="next-btn">Next →</button>
        ` : `
          <button class="btn-primary" id="finish-btn">Finish</button>
        `}
      </div>
    </div>
  `;
  
  attachStudyViewListeners(container, word);
}

/**
 * Attach study view listeners
 */
function attachStudyViewListeners(container, word) {
  const exitBtn = container.querySelector('#exit-btn');
  if (exitBtn) {
    exitBtn.addEventListener('click', () => {
      viewMode = 'list';
      renderListView(container);
    });
  }
  
  const audioBtn = container.querySelector('#audio-btn');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      speakArabic(word.arabic);
    });
  }
  
  const prevBtn = container.querySelector('#prev-btn');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentStudyIndex > 0) {
        currentStudyIndex--;
        renderStudyView(container);
      }
    });
  }
  
  const nextBtn = container.querySelector('#next-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentStudyIndex < personalVocab.length - 1) {
        currentStudyIndex++;
        renderStudyView(container);
      }
    });
  }
  
  const finishBtn = container.querySelector('#finish-btn');
  if (finishBtn) {
    finishBtn.addEventListener('click', () => {
      completeStudySession(container);
    });
  }
}

/**
 * Complete study session
 */
function completeStudySession(container) {
  showToast('Study session complete!');
  viewMode = 'list';
  renderListView(container);
}

/**
 * Check if word already exists in vocab
 */
export async function checkVocabDuplicate(arabic) {
  const { words } = await loadPersonalVocab(AppState.user.email);
  return words.some(w => w.arabic === arabic);
}

/**
 * Save word to My Vocab (called from lesson.js)
 */
export async function saveWordToVocab(phrase, unitTitle) {
  try {
    const category = inferCategory(unitTitle);
    
    const vocabData = {
      arabic: phrase.ar || phrase.arabic,
      romanization: phrase.rom || phrase.romanization || '',
      english: phrase.en || phrase.english,
      source: `Lesson: ${unitTitle}`,
      category: category,
      notes: phrase.context || ''
    };
    
    await savePersonalVocab(AppState.user.email, vocabData);
    showToast('Added to My Vocab!');
  } catch (error) {
    console.error('Error saving to vocab:', error);
  }
}

/**
 * Infer category from unit title
 */
function inferCategory(unitTitle) {
  const title = unitTitle.toLowerCase();
  
  if (title.includes('greet') || title.includes('meeting')) return 'Greetings';
  if (title.includes('family') || title.includes('relationship')) return 'Family';
  if (title.includes('table') || title.includes('food')) return 'Food';
  if (title.includes('love') || title.includes('gratitude') || title.includes('emotion')) return 'Emotions';
  if (title.includes('stay') || title.includes('connect') || title.includes('travel')) return 'Travel';
  
  return 'General';
}

/**
 * Handle CSV import
 */
export async function handleCSVImport(file) {
  if (!window.Papa) {
    showError('CSV parser not loaded');
    return;
  }
  
  window.Papa.parse(file, {
    header: true,
    complete: async (results) => {
      const rows = results.data.filter(row => row.arabic && row.english);
      
      if (rows.length === 0) {
        showError('No valid rows found in CSV');
        return;
      }
      
      // Import all rows
      showLoading(`Importing ${rows.length} words...`);
      
      let imported = 0;
      for (const row of rows) {
        try {
          const isDuplicate = await checkVocabDuplicate(row.arabic);
          if (!isDuplicate) {
            await savePersonalVocab(AppState.user.email, {
              arabic: row.arabic,
              romanization: row.romanization || '',
              english: row.english,
              category: row.category || 'General',
              notes: row.notes || ''
            });
            imported++;
          }
        } catch (error) {
          console.error('Import error:', error);
        }
      }
      
      hideLoading();
      showToast(`Imported ${imported} words!`);
      
      // Reload vocab screen
      const container = document.querySelector('#app-container');
      if (container) {
        renderMyVocabScreen(container);
      }
    },
    error: (error) => {
      showError('Failed to parse CSV');
      console.error('CSV parse error:', error);
    }
  });
}


/**
 * Handle CSV file import
 */
async function handleCSVImport(file, container) {
  showLoading('Parsing CSV...');
  
  if (!window.Papa) {
    showError('CSV parser not loaded. Please refresh the page.');
    hideLoading();
    return;
  }
  
  Papa.parse(file, {
    header: true,
    complete: async (results) => {
      hideLoading();
      await showImportPreview(results.data, container);
    },
    error: (error) => {
      hideLoading();
      showError('Failed to parse CSV: ' + error.message);
    }
  });
}

/**
 * Show import preview modal
 */
async function showImportPreview(rows, container) {
  // Filter out empty rows
  const validRows = rows.filter(row => row.arabic && row.english);
  
  if (validRows.length === 0) {
    showError('No valid rows found. CSV must have "arabic" and "english" columns.');
    return;
  }
  
  // Show preview modal
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>Import Preview</h3>
      <p>Found ${validRows.length} valid words. Preview of first 10:</p>
      
      <div class="csv-preview">
        <table>
          <thead>
            <tr>
              <th>Arabic</th>
              <th>Romanization</th>
              <th>English</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            ${validRows.slice(0, 10).map(row => `
              <tr>
                <td dir="rtl">${row.arabic || ''}</td>
                <td>${row.romanization || '-'}</td>
                <td>${row.english || ''}</td>
                <td>${row.category || 'General'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ${validRows.length > 10 ? `<p class="preview-more">...and ${validRows.length - 10} more</p>` : ''}
      </div>
      
      <div class="modal-buttons">
        <button class="btn-secondary" id="cancel-import">Cancel</button>
        <button class="btn-primary" id="confirm-import">Import ${validRows.length} Words</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.querySelector('#cancel-import').addEventListener('click', () => {
    modal.remove();
  });
  
  modal.querySelector('#confirm-import').addEventListener('click', async () => {
    modal.remove();
    await importWords(validRows, container);
  });
}

/**
 * Import words to database
 */
async function importWords(rows, container) {
  showLoading(`Importing ${rows.length} words...`);
  
  let imported = 0;
  let skipped = 0;
  
  for (const row of rows) {
    // Check for duplicate
    const phraseId = `${row.arabic}_${row.english}`;
    const exists = personalVocab.some(w => `${w.arabic}_${w.english}` === phraseId);
    
    if (exists) {
      skipped++;
      continue;
    }
    
    // Import
    const vocabData = {
      arabic: row.arabic,
      romanization: row.romanization || '',
      english: row.english,
      category: row.category || 'General',
      notes: row.notes || ''
    };
    
    await savePersonalVocab(AppState.user.email, vocabData);
    imported++;
  }
  
  hideLoading();
  showToast(`Imported ${imported} words! ${skipped > 0 ? `(${skipped} duplicates skipped)` : ''}`);
  
  // Refresh vocab list
  renderMyVocabScreen(container);
}
