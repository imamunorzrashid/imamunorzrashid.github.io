import { describe, expect, test } from 'vitest';
import { parseVideo } from '../../src/lib/video';

const yt = (id: string) => ({
  kind: 'youtube',
  embed: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`,
  poster: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
});

describe('parseVideo YouTube', () => {
  test('watch URL with a timestamp', () => {
    expect(parseVideo('https://www.youtube.com/watch?v=abc123XYZ_-&t=30s')).toEqual(yt('abc123XYZ_-'));
  });
  test('youtu.be short link with a share parameter', () => {
    expect(parseVideo('https://youtu.be/abc123XYZ_-?si=q')).toEqual(yt('abc123XYZ_-'));
  });
  test('shorts URL', () => {
    expect(parseVideo('https://www.youtube.com/shorts/abc123XYZ_-')).toEqual(yt('abc123XYZ_-'));
  });
  test('mobile watch URL', () => {
    expect(parseVideo('https://m.youtube.com/watch?v=abc123XYZ_-')).toEqual(yt('abc123XYZ_-'));
  });
  test('playlist becomes a videoseries embed with no poster', () => {
    expect(parseVideo('https://www.youtube.com/playlist?list=PL1')).toEqual({
      kind: 'youtube',
      embed: 'https://www.youtube-nocookie.com/embed/videoseries?list=PL1&autoplay=1',
      poster: undefined,
    });
  });
  test('an ID that is not 11 characters is a plain link, not an iframe', () => {
    expect(parseVideo('https://www.youtube.com/watch?v=short')).toEqual({ kind: 'link' });
    expect(parseVideo('https://youtu.be/')).toEqual({ kind: 'link' });
  });
});

describe('parseVideo Facebook', () => {
  test('watch URL', () => {
    const url = 'https://www.facebook.com/watch/?v=1127887169236901';
    expect(parseVideo(url)).toEqual({
      kind: 'facebook',
      embed: 'https://www.facebook.com/plugins/video.php?show_text=false&autoplay=1&href=' + encodeURIComponent(url),
    });
  });
  test('page video URL, no poster', () => {
    const url = 'https://www.facebook.com/somepage/videos/123/';
    expect(parseVideo(url)).toEqual({
      kind: 'facebook',
      embed: 'https://www.facebook.com/plugins/video.php?show_text=false&autoplay=1&href=' + encodeURIComponent(url),
    });
  });
});

describe('parseVideo links', () => {
  test.each(['https://fb.watch/xyz/', 'https://example.com/a.mp4', 'not a url', '', 'https://www.facebook.com/somepage'])(
    '%j is a plain link',
    (url) => {
      expect(parseVideo(url)).toEqual({ kind: 'link' });
    },
  );
});
