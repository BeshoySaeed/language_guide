# Offline architecture

Phase 6 introduces an explicit-download offline model. The application does not cache every authenticated response or silently copy user data into browser caches.

## Storage boundaries

- The service worker caches the public offline-library shell and same-origin build assets. It never caches `/api/*` responses.
- IndexedDB stores only lessons the learner explicitly downloads, plus a local mutation queue.
- Downloaded lessons contain the same public lesson contract used by the online player. Server-only answer keys are not copied to the browser.
- Removing a downloaded lesson deletes its IndexedDB snapshot. Cached application shell assets remain reusable by other downloads.

## Sync model

Authenticated writes are stored before network delivery. A successful response removes the queued operation. Network and server failures keep retryable work on the device.

Conflict rules are intentionally small and deterministic:

- Saved-item changes use latest-local-intent wins per vocabulary item. A later remove replaces an earlier unsynced save, and vice versa.
- Assessment attempts are append-only. Each attempt carries a stable client operation ID, and the API treats replays idempotently.
- Authentication failures remain visible in the queue instead of being discarded.
- Permanent validation failures remain marked for attention instead of retrying forever.

The browser flushes the queue after connectivity returns. The Offline Library also provides a manual sync action.

## Offline assessment behavior

Questions and selected answers work offline. Because answer keys remain server-only, an offline attempt is queued and graded after reconnection. The lesson player displays the returned score when it is still open.

## Limitations

- Audio currently uses an installed browser/system voice and is not downloaded with a lesson. Provider-backed or human-recorded audio can later be added through the existing audio abstraction.
- Offline downloads cover German A1, A2, and B1 lessons, saved vocabulary changes, and lesson assessments. Mixed practice challenges still require a connection.
- Browser storage may be cleared by the user or operating system. The app requests persistent storage when available but cannot guarantee retention.
