/*
 * StreamGlass helpers for Youlag's video view:
 *
 *  1. "Saved in" chips right under the video's action buttons, one per playlist (FreshRSS label)
 *     the video is in. Tapping a chip removes the video from that playlist — no scrolling past
 *     the description to find the playlist controls.
 *  2. Long descriptions collapse to a few lines on every screen size, with Show more / Show less.
 *
 * Only uses Youlag's DOM (#ylTheaterModal, its class names, and the `ylvideo` URL parameter that
 * holds the open entry's id) and FreshRSS's own tag endpoints, so it keeps working when Youlag's
 * internal code changes. If Youlag isn't installed, nothing here runs.
 */
(() => {
	'use strict';

	const MODAL_ID = 'ylTheaterModal';
	const TAGS_MODAL_ID = 'ylTagsModal';
	const DESC = 'yl-video-description-container';
	const COLLAPSED = 'yl-video-description-container--collapsed';
	const ACTIONS = '.yl-video-actions-container';
	const COLLAPSE_ABOVE_PX = 150;

	const entryId = () => new URL(window.location.href).searchParams.get('ylvideo');
	const csrf = () =>
		(window.context && window.context.csrf) ||
		document.querySelector('input[name="_csrf"]')?.value ||
		'';

	// ───────────── 1. Playlist chips ─────────────

	async function getTags(id) {
		try {
			const r = await fetch(`./?c=tag&a=getTagsForEntry&id_entry=${encodeURIComponent(id)}`);
			if (!r.ok) return [];
			const tags = await r.json();
			return Array.isArray(tags) ? tags : [];
		} catch {
			return [];
		}
	}

	async function setTag(id, tagId, checked) {
		try {
			const r = await fetch('./?c=tag&a=tagEntry&ajax=1', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
				body: JSON.stringify({ id_tag: tagId, name_tag: '', id_entry: id, checked, ajax: 1, _csrf: csrf() }),
			});
			return r.ok && !r.redirected;
		} catch {
			return false;
		}
	}

	async function renderPlaylistChips(modal, force = false) {
		const actions = modal.querySelector(ACTIONS);
		const id = entryId();
		if (!actions || !id) return;
		if (!force && actions.dataset.sgEntry === id) return;
		actions.dataset.sgEntry = id;

		const tags = await getTags(id);
		if (entryId() !== id) return; // another video opened meanwhile
		modal.querySelector('.sg-playlists')?.remove();

		const saved = tags.filter((t) => t.checked);
		if (saved.length === 0) return;

		const row = document.createElement('div');
		row.className = 'sg-playlists';
		const label = document.createElement('span');
		label.className = 'sg-playlists-label';
		label.textContent = 'Saved in';
		row.appendChild(label);

		for (const t of saved) {
			const chip = document.createElement('button');
			chip.type = 'button';
			chip.className = 'sg-playlist-chip';
			chip.title = `Remove from ${t.name}`;
			const name = document.createElement('span');
			name.textContent = t.name;
			const x = document.createElement('span');
			x.className = 'sg-chip-x';
			x.setAttribute('aria-hidden', 'true');
			x.textContent = '✕';
			chip.append(name, x);
			chip.addEventListener('click', async (e) => {
				e.preventDefault();
				e.stopPropagation();
				chip.disabled = true;
				if (await setTag(id, t.id, false)) {
					chip.remove();
					if (!row.querySelector('.sg-playlist-chip')) row.remove();
				} else {
					chip.disabled = false;
					chip.classList.add('sg-chip-error');
					chip.title = 'Could not remove — try again';
				}
			});
			row.appendChild(chip);
		}
		actions.after(row);
	}

	// ───────────── 2. Collapsible description ─────────────

	function setupDescription(modal) {
		const box = modal.querySelector('.' + DESC);
		if (!box || box.dataset.sgDesc) return;
		box.dataset.sgDesc = '1';

		requestAnimationFrame(() => {
			const wasCollapsed = box.classList.contains(COLLAPSED);
			box.classList.remove(COLLAPSED);
			const tall = box.scrollHeight > COLLAPSE_ABOVE_PX;
			if (!tall) {
				if (wasCollapsed) box.classList.add(COLLAPSED);
				return;
			}
			box.classList.add('sg-desc', COLLAPSED);

			const btn = document.createElement('button');
			btn.type = 'button';
			btn.className = 'sg-desc-toggle';
			const sync = () => {
				btn.textContent = box.classList.contains(COLLAPSED) ? 'Show more' : 'Show less';
			};
			btn.addEventListener('click', (e) => {
				e.preventDefault();
				e.stopPropagation(); // Youlag's own tap-to-expand listener stays out of it
				box.classList.toggle(COLLAPSED);
				sync();
			});
			// Youlag can also expand it (tap on mobile); keep the label honest.
			new MutationObserver(sync).observe(box, { attributes: true, attributeFilter: ['class'] });
			sync();
			box.appendChild(btn);
		});
	}

	// ───────────── Wiring ─────────────

	let scheduled = false;
	function scan() {
		scheduled = false;
		const modal = document.getElementById(MODAL_ID);
		if (!modal) return;
		renderPlaylistChips(modal);
		setupDescription(modal);
	}

	const observer = new MutationObserver((mutations) => {
		for (const m of mutations) {
			// Playlists changed in Youlag's own "Save to…" dialog: refresh the chips when it closes.
			for (const n of m.removedNodes) {
				if (n.id === TAGS_MODAL_ID) {
					const modal = document.getElementById(MODAL_ID);
					if (modal) renderPlaylistChips(modal, true);
				}
			}
		}
		if (!scheduled) {
			scheduled = true;
			requestAnimationFrame(scan);
		}
	});

	function start() {
		observer.observe(document.body, { childList: true, subtree: true });
		scan();
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
	else start();
})();
