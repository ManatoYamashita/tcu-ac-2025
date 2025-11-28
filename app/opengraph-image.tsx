import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'manapuraza blog';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ marginBottom: 20, fontWeight: 'bold' }}>manapuraza blog</div>
        <div style={{ fontSize: 48, opacity: 0.9 }}>技術ブログ</div>
      </div>
    ),
    {
      ...size,
    }
  );
}
