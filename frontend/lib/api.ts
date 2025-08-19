export const getApiBaseUrl = (): string => {
	if (typeof window !== 'undefined') {
		const host = window.location.hostname;
		if (host === 'localhost' || host === '127.0.0.1') {
			return 'http://127.0.0.1:8080';
		}
	}
	return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080';
};
