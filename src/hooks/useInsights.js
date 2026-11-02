import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchInsights } from '../services/api'
import { usePreferences } from './usePreferences'

export function useInsights() {
  const { preferences } = usePreferences()
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['insights'], queryFn: ({ signal }) => fetchInsights(signal), retry: 1, refetchInterval: preferences.autoRefresh ? 300000 : false, refetchIntervalInBackground: false, staleTime: 60000 })
  return { ...query, snapshots: query.data?.snapshots || [], latest: query.data?.latest || null, refresh: () => queryClient.invalidateQueries({ queryKey: ['insights'] }) }
}
