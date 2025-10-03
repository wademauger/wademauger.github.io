import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import GoogleDriveServiceModern from '../apps/songs/services/GoogleDriveServiceModern';

// Hook to fetch the full library JSON using React Query (v5 object API)
export function useLibraryQuery() {
  return useQuery({
    queryKey: ['library', 'full'],
    queryFn: async () => {
      const lib = await GoogleDriveServiceModern.loadLibrary();
      return lib;
    },
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false
  });
}

// Hook to save the library and invalidate the cache on success (v5 object API)
export function useSaveLibraryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (libraryData: any) => {
      const res = await GoogleDriveServiceModern.saveLibrary(libraryData);
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['library', 'full'] });
    }
  });
}
