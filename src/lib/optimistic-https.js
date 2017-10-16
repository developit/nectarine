const HTTPS_DOMAINS = /^http:\/\/(s3\.amazonaws\.com|[^/]+\.imgur\.com|[^/]+\.squarespace\.com)(\/|$)/;

export default function optimisticHttps(url) {
	if (HTTPS_DOMAINS.test(url)) {
		return url.replace('http://', 'https://');
	}
	return url;
}