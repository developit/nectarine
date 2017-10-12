const HTTPS_DOMAINS = /^http:\/\/(s3\.amazonaws\.com|[^/]+\.squarespace\.com)(\/|$)/g;

export default function optimisticHttps(url) {
	if (HTTPS_DOMAINS.test(url)) {
		return url.replace('http://', 'https://');
	}
	return url;
}