export type Video = { kind: 'youtube' | 'facebook' | 'link'; embed?: string; poster?: string };

const YT_HOSTS = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'];
const FB_HOSTS = ['www.facebook.com', 'facebook.com'];
const VIDEO_ID = /^[\w-]{11}$/;
const LIST_ID = /^[\w-]+$/;
const FB_ID = /^\d+$/;

// Malformed input and non-video URLs fall back to a plain link. Nothing here loads a player.
export function parseVideo(input: string): Video {
  let u: URL;
  try {
    u = new URL(input);
  } catch {
    return { kind: 'link' };
  }
  if (YT_HOSTS.includes(u.hostname)) return youtube(u);
  if (FB_HOSTS.includes(u.hostname)) return facebook(input, u);
  return { kind: 'link' };
}

function youtube(u: URL): Video {
  const seg = u.pathname.split('/');
  let id: string | null | undefined;
  if (u.hostname === 'youtu.be') id = seg[1];
  else if (seg[1] === 'shorts') id = seg[2];
  else if (u.pathname === '/watch') id = u.searchParams.get('v');
  if (id && VIDEO_ID.test(id)) {
    return {
      kind: 'youtube',
      embed: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`,
      poster: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
  }
  const list = u.searchParams.get('list');
  if (list && LIST_ID.test(list)) {
    return { kind: 'youtube', embed: `https://www.youtube-nocookie.com/embed/videoseries?list=${list}&autoplay=1` };
  }
  return { kind: 'link' };
}

function facebook(input: string, u: URL): Video {
  const watch = u.pathname.replace(/\/$/, '') === '/watch' && FB_ID.test(u.searchParams.get('v') ?? '');
  const page = /^\/[^/]+\/videos\/\d+/.test(u.pathname);
  if (!watch && !page) return { kind: 'link' };
  return {
    kind: 'facebook',
    embed: 'https://www.facebook.com/plugins/video.php?show_text=false&autoplay=1&href=' + encodeURIComponent(input),
  };
}
