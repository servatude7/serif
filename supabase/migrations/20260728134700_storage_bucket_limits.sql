-- The `avatars` and `blog-images` buckets stay public: cover images and avatars
-- are rendered through next/image and embedded in OG tags, both of which need
-- unauthenticated GETs. What was missing is a limit at the storage layer — the
-- 5 MB / image-mime checks only existed in the server actions, so anything that
-- reached the storage API directly with a user's token could store an arbitrary
-- file type or size under their own folder.
update storage.buckets
set
  file_size_limit = 5242880, -- 5 MB, matching MAX_IMAGE_SIZE in lib/storage.ts
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ]
where id in ('avatars', 'blog-images');
