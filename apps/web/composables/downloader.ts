type ReleasePlatform = 'windows-x86_64';
interface ReleasePlatformData {
  url: string;
  signature: string;
}
interface ReleaseInfo {
  version: string;
  pub_date: string;
  platforms: Record<ReleasePlatform, ReleasePlatformData>;
}

export function useAppDownloader() {
  async function getReleaseInfo() {
    const response = await fetch(
      'https://gist.githubusercontent.com/Kholid060/2ab6f75e83105193fb8ea29b30ae1893/raw/snippy-release.json',
    );
    return (await response.json()) as ReleaseInfo;
  }
  async function download() {
    const release = await getReleaseInfo();
    const url = release.platforms['windows-x86_64'].url;

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = '';

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  return {
    download,
    getReleaseInfo,
  };
}
