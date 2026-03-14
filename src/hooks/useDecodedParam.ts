import { useParams } from 'react-router-dom'

export function useDecodedParam(paramName: string): string {
	const params = useParams()
	const value = params[paramName]
	return value ? decodeURIComponent(value) : ''
}
