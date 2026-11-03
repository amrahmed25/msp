/**
 * community.js — Community page module for PortfolioHub
 * Handles post loading, creation, editing, deletion, filtering, and pagination.
 */

import supabase from './supabase-client.js';
import { showToast, sanitize, formatRelativeDate, debounce } from './utils.js';
import { publicUrl } from './portfolio-service.js';

// ─── State ────────────────────────────────────────────────────────────────────
let currentUser = null;
let currentPage = 0;
const PAGE_SIZE = 10;
let currentCategory = 'all';
let currentSearch = '';
let currentTags = [];           // active tag filter
let editingPostId = null;       // track if modal is in edit mode
let postImageFile = null;       // pending image for upload
let pendingDeleteId = null;     // post awaiting delete confirm
let totalPosts = 0;
let hasMore = true;

// ─── Init ─────────────────────────────────────────────────────────────────────
async function init() {
  await resolveUser();
  setupNavUI();
  bindFilterHandlers();
  bindSearchHandler();
  initCreatePostModal();
  initDeleteModal();
  await Promise.all([loadPosts(true), loadStats(), loadPopularTags()]);
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
async function resolveUser() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      currentUser = session.user;
    }
  } catch (_) {
    currentUser = null;
  }
}

// ─── Nav UI ───────────────────────────────────────────────────────────────────
function setupNavUI() {
  const createBtn = document.getElementById('create-post-btn');
  const createCard = document.getElementById('create-post-card');

  if (currentUser) {
    if (createBtn) createBtn.style.display = 'flex';
    if (createCard) createCard.style.display = 'flex';

    // Set avatar initials
    const initialsEl = document.getElementById('feed-user-initials');
    if (initialsEl) {
      const email = currentUser.email || '';
      initialsEl.textContent = getInitials(email, 2);
    }

    // Header create button
    if (createBtn) {
      createBtn.addEventListener('click', () => openCreatePostModal());
    }
    // Feed prompt button
    const promptBtn = document.getElementById('create-post-prompt-btn');
    if (promptBtn) {
      promptBtn.addEventListener('click', () => openCreatePostModal());
    }
  } else {
    if (createBtn) createBtn.style.display = 'none';
    if (createCard) createCard.style.display = 'none';
  }
}

// ─── Filters ──────────────────────────────────────────────────────────────────
function bindFilterHandlers() {
  const pills = document.querySelectorAll('#category-pills .category-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.dataset.category;
      currentPage = 0;
      loadPosts(true);
    });
  });
}

// ─── Search ───────────────────────────────────────────────────────────────────
function bindSearchHandler() {
  const searchInput = document.getElementById('search-input');
  const clearBtn = document.getElementById('search-clear');

  if (!searchInput) return;

  const debouncedSearch = debounce(() => {
    currentSearch = searchInput.value.trim();
    currentPage = 0;
    loadPosts(true);
  }, 400);

  searchInput.addEventListener('input', () => {
    clearBtn.style.display = searchInput.value ? 'flex' : 'none';
    debouncedSearch();
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.style.display = 'none';
    currentSearch = '';
    currentPage = 0;
    loadPosts(true);
  });
}

// ─── Load Posts ───────────────────────────────────────────────────────────────
async function loadPosts(reset = false) {
  if (reset) {
    currentPage = 0;
    hasMore = true;
    document.getElementById('posts-list').innerHTML = '';
  }

  const skeleton = document.getElementById('posts-skeleton');
  const emptyEl  = document.getElementById('posts-empty');
  const loadMoreWrap = document.getElementById('load-more-wrap');
  const loadMoreBtn  = document.getElementById('load-more-btn');

  if (skeleton && currentPage === 0) skeleton.style.display = 'block';
  if (emptyEl) emptyEl.style.display = 'none';
  if (loadMoreWrap) loadMoreWrap.style.display = 'none';

  try {
    let query = supabase
      .from('community_posts')
      .select(`
        id,
        content,
        category,
        tags,
        image_url,
        portfolio_id,
        created_at,
        updated_at,
        user_id,
        profiles (
          id,
          full_name,
          title,
          avatar_url
        ),
        portfolios ( slug, is_published )
      `)
      .order('created_at', { ascending: false })
      .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);

    if (currentCategory && currentCategory !== 'all') {
      query = query.eq('category', currentCategory);
    }

    if (currentSearch) {
      query = query.or(
        `content.ilike.%${currentSearch}%,profiles.full_name.ilike.%${currentSearch}%`
      );
    }

    const { data: posts, error } = await query;

    if (error) throw error;

    if (skeleton && currentPage === 0) skeleton.style.display = 'none';

    const postsList = document.getElementById('posts-list');

    if (!posts || posts.length === 0) {
      if (currentPage === 0) {
        if (emptyEl) emptyEl.style.display = 'flex';
      }
      hasMore = false;
    } else {
      posts.forEach(post => {
        const html = renderPost(post);
        const div = document.createElement('div');
        div.innerHTML = html;
        postsList.appendChild(div.firstElementChild);
      });

      hasMore = posts.length === PAGE_SIZE;
      if (hasMore && loadMoreWrap) {
        loadMoreWrap.style.display = 'flex';
        if (loadMoreBtn) {
          loadMoreBtn.onclick = () => {
            currentPage++;
            loadPosts(false);
          };
        }
      } else {
        if (loadMoreWrap) loadMoreWrap.style.display = 'none';
      }

      bindPostCardActions();
    }
  } catch (err) {
    console.error('Error loading posts:', err);
    if (skeleton) skeleton.style.display = 'none';
    showToast('Failed to load posts. Please try again.', 'error');
  }
}

// ─── Render Post ──────────────────────────────────────────────────────────────
function renderPost(post) {
  const profile = post.profiles || {};
  const authorName = sanitize(profile.full_name || 'Anonymous');
  const authorTitle = sanitize(profile.title || '');
  // The post links to the author's portfolio only when one was attached and is published.
  const linked = post.portfolios && post.portfolios.is_published ? post.portfolios.slug : '';
  const authorUrl = linked ? sanitize(publicUrl(linked)) : '';
  const avatarUrl   = profile.avatar_url || '';
  const content     = sanitize(post.content || '');
  const category    = sanitize(post.category || 'Other');
  const tags        = Array.isArray(post.tags) ? post.tags : [];
  const imageUrl    = post.image_url || '';
  const relDate     = formatRelativeDate(post.created_at);
  const isEdited    = post.updated_at && post.updated_at !== post.created_at;

  const isOwner = currentUser && currentUser.id === post.user_id;

  const avatarHtml = avatarUrl
    ? `<img src="${sanitize(avatarUrl)}" alt="${authorName}" class="post-author-avatar" />`
    : `<div class="post-author-avatar post-author-avatar--initials" style="background:${generateAvatarColor(authorName)}">${getInitials(authorName, 2)}</div>`;

  const tagsHtml = tags.map(t =>
    `<button class="post-tag" data-tag="${sanitize(t)}">${sanitize(t)}</button>`
  ).join('');

  const imageHtml = imageUrl
    ? `<div class="post-image-wrap"><img src="${sanitize(imageUrl)}" alt="Post image" class="post-image" loading="lazy" /></div>`
    : '';

  const ownerActions = isOwner
    ? `<button class="post-action-btn post-edit-btn" data-post-id="${sanitize(post.id)}" title="Edit post">
         <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
         Edit
       </button>
       <button class="post-action-btn post-delete-btn" data-post-id="${sanitize(post.id)}" title="Delete post">
         <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
         Delete
       </button>`
    : '';

  const portfolioBtn = authorUrl
    ? `<a href="${authorUrl}" class="btn btn-sm btn-outline post-portfolio-btn" target="_blank" rel="noopener">
         <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
         View Portfolio
       </a>`
    : '';

  const authorLink = authorUrl
    ? `<a href="${authorUrl}" class="post-author-name">${authorName}</a>`
    : `<span class="post-author-name">${authorName}</span>`;

  return `
    <article class="post-card" data-post-id="${sanitize(post.id)}">
      <div class="post-card-header">
        <div class="post-author-info">
          <div class="post-author-avatar-wrap">
            ${avatarHtml}
          </div>
          <div class="post-author-meta">
            ${authorLink}
            ${authorTitle ? `<span class="post-author-title">${authorTitle}</span>` : ''}
            <span class="post-timestamp">${relDate}${isEdited ? ' · edited' : ''}</span>
          </div>
        </div>
        <div class="post-header-right">
          <span class="post-category-badge">${category}</span>
          <div class="post-owner-actions">${ownerActions}</div>
        </div>
      </div>
      ${imageHtml}
      <div class="post-card-body">
        <div class="post-content" data-full="${encodeURIComponent(content)}">
          <p class="post-content-text truncated">${content}</p>
          ${content.length > 300 ? `<button class="read-more-btn">Read more</button>` : ''}
        </div>
      </div>
      ${tagsHtml || portfolioBtn ? `
      <div class="post-card-footer">
        <div class="post-tags">${tagsHtml}</div>
        <div class="post-footer-actions">${portfolioBtn}</div>
      </div>` : ''}
    </article>
  `;
}

// ─── Post Card Actions ────────────────────────────────────────────────────────
function bindPostCardActions() {
  // Read More buttons
  document.querySelectorAll('.read-more-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const contentEl = e.target.closest('.post-content');
      const textEl = contentEl?.querySelector('.post-content-text');
      if (!textEl) return;
      if (textEl.classList.contains('truncated')) {
        textEl.classList.remove('truncated');
        e.target.textContent = 'Show less';
      } else {
        textEl.classList.add('truncated');
        e.target.textContent = 'Read more';
      }
    });
  });

  // Tag filter buttons
  document.querySelectorAll('.post-tag').forEach(btn => {
    btn.addEventListener('click', e => {
      const tag = e.target.dataset.tag;
      if (tag) filterByTag(tag);
    });
  });

  // Edit buttons
  document.querySelectorAll('.post-edit-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const postId = e.currentTarget.dataset.postId;
      openEditPostModal(postId);
    });
  });

  // Delete buttons
  document.querySelectorAll('.post-delete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const postId = e.currentTarget.dataset.postId;
      openDeleteModal(postId);
    });
  });
}

// ─── Tag Filter ───────────────────────────────────────────────────────────────
function filterByTag(tag) {
  currentSearch = tag;
  currentPage = 0;
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.value = tag;
    document.getElementById('search-clear').style.display = 'flex';
  }
  loadPosts(true);
}

// ─── Create Post Modal ────────────────────────────────────────────────────────
function initCreatePostModal() {
  const overlay   = document.getElementById('post-modal-overlay');
  const closeBtn  = document.getElementById('post-modal-close');
  const cancelBtn = document.getElementById('post-cancel-btn');
  const submitBtn = document.getElementById('post-submit-btn');
  const textarea  = document.getElementById('post-content');
  const tagsInput = document.getElementById('tags-input');
  const imageInput  = document.getElementById('post-image-input');
  const imageArea   = document.getElementById('image-upload-area');
  const placeholder = document.getElementById('image-upload-placeholder');
  const preview     = document.getElementById('image-preview');
  const removeImgBtn = document.getElementById('remove-image-btn');

  if (!overlay) return;

  // Close handlers
  closeBtn?.addEventListener('click', closePostModal);
  cancelBtn?.addEventListener('click', closePostModal);
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closePostModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) closePostModal();
  });

  // Char counter
  textarea?.addEventListener('input', () => {
    const count = textarea.value.length;
    document.getElementById('post-char-count').textContent = count;
    const meta = document.querySelector('.char-count');
    if (meta) {
      meta.classList.toggle('warn', count > 900);
      meta.classList.toggle('danger', count >= 1000);
    }
  });

  // Tag input
  const tagsList = document.getElementById('tags-list');
  const tagsCountEl = document.getElementById('tags-count');
  let currentTagsList = [];

  function renderTags() {
    if (!tagsList) return;
    tagsList.innerHTML = '';
    currentTagsList.forEach((tag, idx) => {
      const pill = document.createElement('span');
      pill.className = 'tag-pill';
      pill.innerHTML = `${sanitize(tag)}<button class="tag-remove" data-idx="${idx}" aria-label="Remove tag">✕</button>`;
      tagsList.appendChild(pill);
    });
    tagsList.querySelectorAll('.tag-remove').forEach(btn => {
      btn.addEventListener('click', e => {
        const idx = parseInt(e.currentTarget.dataset.idx);
        currentTagsList.splice(idx, 1);
        renderTags();
      });
    });
    if (tagsCountEl) tagsCountEl.textContent = currentTagsList.length;
  }

  tagsInput?.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ',') && tagsInput.value.trim()) {
      e.preventDefault();
      const tag = tagsInput.value.trim().replace(/,$/, '').toLowerCase();
      if (tag && !currentTagsList.includes(tag) && currentTagsList.length < 5) {
        currentTagsList.push(tag);
        renderTags();
      }
      tagsInput.value = '';
    }
    if (e.key === 'Backspace' && !tagsInput.value && currentTagsList.length > 0) {
      currentTagsList.pop();
      renderTags();
    }
  });

  // Image upload
  if (imageArea) {
    imageArea.addEventListener('click', e => {
      if (e.target !== removeImgBtn && !removeImgBtn.contains(e.target)) {
        imageInput.click();
      }
    });
  }

  imageInput?.addEventListener('change', () => {
    const file = imageInput.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be under 5MB', 'error');
      imageInput.value = '';
      return;
    }
    postImageFile = file;
    const reader = new FileReader();
    reader.onload = e => {
      preview.src = e.target.result;
      preview.style.display = 'block';
      placeholder.style.display = 'none';
      removeImgBtn.style.display = 'flex';
    };
    reader.readAsDataURL(file);
  });

  removeImgBtn?.addEventListener('click', e => {
    e.stopPropagation();
    postImageFile = null;
    imageInput.value = '';
    preview.src = '';
    preview.style.display = 'none';
    placeholder.style.display = 'flex';
    removeImgBtn.style.display = 'none';
  });

  // Submit
  submitBtn?.addEventListener('click', async () => {
    const content  = document.getElementById('post-content').value.trim();
    const category = document.getElementById('post-category').value;
    const linkPortfolio = document.getElementById('link-portfolio-toggle').checked;
    const errorEl  = document.getElementById('post-form-error');

    if (!content || content.length < 20) {
      showFormError(errorEl, 'Post content must be at least 20 characters.');
      return;
    }
    if (!category) {
      showFormError(errorEl, 'Please select a category.');
      return;
    }
    if (errorEl) errorEl.style.display = 'none';

    setSubmitLoading(true);

    try {
      let imageUrl = null;
      if (postImageFile) {
        imageUrl = await uploadPostImage(postImageFile);
      }

      let portfolioId = null;
      if (linkPortfolio) {
        portfolioId = await getOwnPublishedPortfolioId();
        if (!portfolioId) {
          showFormError(errorEl, 'Publish one of your portfolios first, or turn off "Link my portfolio".');
          setSubmitLoading(false);
          return;
        }
      }

      const postData = {
        content,
        category,
        tags: currentTagsList,
        portfolio_id: portfolioId,
        ...(imageUrl !== null ? { image_url: imageUrl } : {})
      };

      if (editingPostId) {
        await editPost(editingPostId, postData);
      } else {
        await createPost(postData);
      }

      closePostModal();
    } catch (err) {
      console.error('Post submit error:', err);
      showFormError(errorEl, err.message || 'Failed to save post. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  });

  // Store tag state reference for modal reuse
  initCreatePostModal._getTagsList = () => currentTagsList;
  initCreatePostModal._setTagsList = (list) => { currentTagsList = list; renderTags(); };
  initCreatePostModal._resetTags = () => { currentTagsList = []; renderTags(); };
}

function openCreatePostModal() {
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }
  editingPostId = null;
  postImageFile = null;
  resetPostForm();
  document.getElementById('post-modal-title').textContent = 'Create Post';
  document.getElementById('post-submit-label').textContent = 'Post';
  openModal('post-modal-overlay');
}

async function openEditPostModal(postId) {
  // Fetch post data
  const { data: post, error } = await supabase
    .from('community_posts')
    .select('*')
    .eq('id', postId)
    .single();

  if (error || !post) {
    showToast('Could not load post for editing.', 'error');
    return;
  }

  editingPostId = postId;
  postImageFile = null;

  resetPostForm();
  document.getElementById('post-modal-title').textContent = 'Edit Post';
  document.getElementById('post-submit-label').textContent = 'Save Changes';

  document.getElementById('post-content').value = post.content || '';
  document.getElementById('post-char-count').textContent = (post.content || '').length;
  document.getElementById('post-category').value = post.category || '';
  document.getElementById('link-portfolio-toggle').checked = !!post.portfolio_id;

  if (initCreatePostModal._setTagsList) {
    initCreatePostModal._setTagsList(Array.isArray(post.tags) ? [...post.tags] : []);
  }

  // Show existing image
  if (post.image_url) {
    const preview = document.getElementById('image-preview');
    const placeholder = document.getElementById('image-upload-placeholder');
    const removeBtn = document.getElementById('remove-image-btn');
    if (preview) { preview.src = post.image_url; preview.style.display = 'block'; }
    if (placeholder) placeholder.style.display = 'none';
    if (removeBtn) removeBtn.style.display = 'flex';
  }

  openModal('post-modal-overlay');
}

function closePostModal() {
  closeModal('post-modal-overlay');
  editingPostId = null;
  postImageFile = null;
}

function resetPostForm() {
  const form = document.getElementById('post-form');
  if (form) form.reset();
  document.getElementById('post-char-count').textContent = '0';
  document.getElementById('post-form-error').style.display = 'none';
  const preview = document.getElementById('image-preview');
  const placeholder = document.getElementById('image-upload-placeholder');
  const removeBtn = document.getElementById('remove-image-btn');
  if (preview) { preview.src = ''; preview.style.display = 'none'; }
  if (placeholder) placeholder.style.display = 'flex';
  if (removeBtn) removeBtn.style.display = 'none';
  if (initCreatePostModal._resetTags) initCreatePostModal._resetTags();
}

function setSubmitLoading(loading) {
  const btn = document.getElementById('post-submit-btn');
  const label = document.getElementById('post-submit-label');
  const spinner = document.getElementById('post-submit-spinner');
  if (!btn) return;
  btn.disabled = loading;
  if (label) label.style.display = loading ? 'none' : 'inline';
  if (spinner) spinner.style.display = loading ? 'inline-block' : 'none';
}

// ─── Linked portfolio ─────────────────────────────────────────────────────────
async function getOwnPublishedPortfolioId() {
  const { data, error } = await supabase
    .from('portfolios')
    .select('id')
    .eq('user_id', currentUser.id)
    .eq('is_published', true)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? data.id : null;
}

// ─── Create Post ──────────────────────────────────────────────────────────────
async function createPost(data) {
  const { data: post, error } = await supabase
    .from('community_posts')
    .insert([{ ...data, user_id: currentUser.id }])
    .select(`
      id, content, category, tags, image_url, portfolio_id,
      created_at, updated_at, user_id,
      profiles ( id, full_name, title, avatar_url ),
      portfolios ( slug, is_published )
    `)
    .single();

  if (error) throw error;

  totalPosts++;
  updateStatDisplay('stat-posts', totalPosts);

  const postsList = document.getElementById('posts-list');
  const emptyEl   = document.getElementById('posts-empty');
  if (emptyEl) emptyEl.style.display = 'none';

  const div = document.createElement('div');
  div.innerHTML = renderPost(post);
  postsList.prepend(div.firstElementChild);
  bindPostCardActions();

  showToast('Post published successfully!', 'success');
}

// ─── Edit Post ────────────────────────────────────────────────────────────────
async function editPost(postId, data) {
  const { data: updated, error } = await supabase
    .from('community_posts')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', postId)
    .select(`
      id, content, category, tags, image_url, portfolio_id,
      created_at, updated_at, user_id,
      profiles ( id, full_name, title, avatar_url ),
      portfolios ( slug, is_published )
    `)
    .single();

  if (error) throw error;

  // Replace card in DOM
  const oldCard = document.querySelector(`.post-card[data-post-id="${postId}"]`);
  if (oldCard) {
    const div = document.createElement('div');
    div.innerHTML = renderPost(updated);
    oldCard.replaceWith(div.firstElementChild);
    bindPostCardActions();
  }

  showToast('Post updated successfully!', 'success');
}

// ─── Upload Image ─────────────────────────────────────────────────────────────
const POST_IMAGE_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
const POST_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

async function uploadPostImage(file) {
  const ext = POST_IMAGE_TYPES[file.type];
  if (!ext) throw new Error('Use a JPG, PNG, WebP or GIF image.');
  if (file.size > POST_IMAGE_MAX_BYTES) throw new Error('That image is larger than 5 MB.');
  const fileName = `post-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const filePath = `${currentUser.id}/posts/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('community-images')
    .upload(filePath, file, { cacheControl: '3600', upsert: false, contentType: file.type });

  if (uploadError) throw new Error('Image upload failed: ' + uploadError.message);

  const { data } = supabase.storage.from('community-images').getPublicUrl(filePath);
  return data.publicUrl;
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────
function initDeleteModal() {
  const overlay    = document.getElementById('delete-modal-overlay');
  const closeBtn   = document.getElementById('delete-modal-close');
  const cancelBtn  = document.getElementById('delete-cancel-btn');
  const confirmBtn = document.getElementById('delete-confirm-btn');

  closeBtn?.addEventListener('click', closeDeleteModal);
  cancelBtn?.addEventListener('click', closeDeleteModal);
  overlay?.addEventListener('click', e => { if (e.target === overlay) closeDeleteModal(); });

  confirmBtn?.addEventListener('click', async () => {
    if (!pendingDeleteId) return;
    await deletePost(pendingDeleteId);
    closeDeleteModal();
  });
}

function openDeleteModal(postId) {
  pendingDeleteId = postId;
  openModal('delete-modal-overlay');
}

function closeDeleteModal() {
  pendingDeleteId = null;
  closeModal('delete-modal-overlay');
}

// ─── Delete Post ──────────────────────────────────────────────────────────────
async function deletePost(postId) {
  try {
    const { error } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;

    const card = document.querySelector(`.post-card[data-post-id="${postId}"]`);
    if (card) {
      card.style.transition = 'opacity 0.3s, transform 0.3s';
      card.style.opacity = '0';
      card.style.transform = 'scale(0.95)';
      setTimeout(() => card.remove(), 300);
    }

    totalPosts = Math.max(0, totalPosts - 1);
    updateStatDisplay('stat-posts', totalPosts);

    showToast('Post deleted.', 'success');
  } catch (err) {
    console.error('Delete error:', err);
    showToast('Failed to delete post.', 'error');
  }
}

// ─── Stats ────────────────────────────────────────────────────────────────────
async function loadStats() {
  try {
    const [{ count: postsCount }, { count: profilesCount }] = await Promise.all([
      supabase.from('community_posts').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true })
    ]);

    totalPosts = postsCount || 0;
    updateStatDisplay('stat-posts', postsCount || 0);
    updateStatDisplay('stat-professionals', profilesCount || 0);

    // Category counts
    await loadCategoryCounts();
  } catch (err) {
    console.error('Stats error:', err);
  }
}

async function loadCategoryCounts() {
  const cats = [
    { id: 'cat-count-web',       category: 'Web Development'   },
    { id: 'cat-count-uiux',      category: 'UI/UX Design'      },
    { id: 'cat-count-mobile',    category: 'Mobile Development' },
    { id: 'cat-count-graphic',   category: 'Graphic Design'    },
    { id: 'cat-count-marketing', category: 'Digital Marketing'  },
    { id: 'cat-count-content',   category: 'Content Creation'   }
  ];

  await Promise.all(cats.map(async ({ id, category }) => {
    const { count } = await supabase
      .from('community_posts')
      .select('id', { count: 'exact', head: true })
      .eq('category', category);
    updateStatDisplay(id, count || 0);
  }));
}

function updateStatDisplay(elId, value) {
  const el = document.getElementById(elId);
  if (el) el.textContent = formatNumber(value);
}

// ─── Popular Tags ─────────────────────────────────────────────────────────────
async function loadPopularTags() {
  try {
    const { data, error } = await supabase
      .from('community_posts')
      .select('tags')
      .not('tags', 'is', null)
      .limit(200);

    if (error) throw error;

    const tagFreq = {};
    (data || []).forEach(row => {
      (Array.isArray(row.tags) ? row.tags : []).forEach(tag => {
        if (tag) tagFreq[tag] = (tagFreq[tag] || 0) + 1;
      });
    });

    const sorted = Object.entries(tagFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);

    const cloudEl = document.getElementById('tag-cloud');
    if (!cloudEl) return;

    if (sorted.length === 0) {
      cloudEl.innerHTML = '<p class="no-tags-msg">No tags yet</p>';
      return;
    }

    cloudEl.innerHTML = sorted.map(([tag, count]) =>
      `<button class="tag-cloud-pill" data-tag="${sanitize(tag)}">${sanitize(tag)} <span class="tag-freq">${count}</span></button>`
    ).join('');

    cloudEl.querySelectorAll('.tag-cloud-pill').forEach(btn => {
      btn.addEventListener('click', () => filterByTag(btn.dataset.tag));
    });
  } catch (err) {
    console.error('Tags error:', err);
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────────
function openModal(overlayId) {
  const overlay = document.getElementById(overlayId);
  if (overlay) {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(overlayId) {
  const overlay = document.getElementById(overlayId);
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function showFormError(el, msg) {
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
}

function getInitials(name, max = 2) {
  if (!name) return '?';
  return name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, max)
    .map(w => w[0].toUpperCase())
    .join('');
}

function generateAvatarColor(str) {
  const colors = ['#2563EB','#7C3AED','#059669','#D97706','#DC2626','#0891B2','#7C3AED','#BE185D'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function formatNumber(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

export { init };
