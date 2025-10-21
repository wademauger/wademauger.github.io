import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import GoogleDriveServiceModern from '../apps/songs/services/GoogleDriveServiceModern';

// Hook to fetch the full library JSON using React Query (v5 object API)
export function useLibraryQuery() {
  return useQuery({
    queryKey: ['library', 'full'],
    queryFn: async () => {
      console.log('🚀 useLibraryQuery: Starting library fetch...');
      try {
        const lib = await GoogleDriveServiceModern.loadLibrary();
        console.log('📚 useLibraryQuery: Library loaded successfully:', {
          hasArtists: !!(lib?.artists),
          artistCount: lib?.artists?.length || 0,
          totalSongs: lib?.artists ? lib.artists.reduce((total: number, artist: any) => {
            return total + (artist.albums || []).reduce((albumTotal: number, album: any) => {
              return albumTotal + (album.songs || []).length;
            }, 0);
          }, 0) : 0,
          libraryStructure: lib ? Object.keys(lib) : []
        });
        return lib;
      } catch (error) {
        console.error('❌ useLibraryQuery: Failed to load library:', error);
        throw error;
      }
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
