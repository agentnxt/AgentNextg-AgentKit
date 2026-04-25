export function openPopupWindow(target: string) {
  const targetUrl = new URL(target);

  let url: string;
  // safe to open directly if in the same origin
  if (targetUrl.origin === location.origin) {
    url = target;
  } else {
    const redirectProxy = location.origin + '/redirect-proxy';
    const search = new URLSearchParams({
      redirect_uri: target,
    });

    url = `${redirectProxy}?${search.toString()}`;
  }
  window.open(url, '_blank', 'popup noreferrer noopener');
}
