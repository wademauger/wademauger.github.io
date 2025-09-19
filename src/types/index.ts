// Global type definitions for the application

// Redux Store Types
export interface RootState {
  chords: ChordsState;
  songs: SongsState;
  recipes: RecipesState;
}

export interface ChordsState {
  pinnedChords: string[];
  currentInstrument: Instrument;
  transposeBy: Record<string, number>;
  chordFingerings: Record<string, ChordFingering>;
}

export interface SongsState {
  library: Library;
  selectedSong: Song | null;
  isGoogleDriveConnected: boolean;
  userInfo: UserInfo | null;
  isLoading: boolean;
  error: string | null;
}

export interface RecipesState {
  editingEnabled: boolean;
  isGoogleDriveConnected: boolean;
  userInfo: UserInfo | null;
  driveRecipes: Recipe[];
  isLoading: boolean;
  error: string | null;
  draftRecipe: Recipe | null;
  isPrintMode: boolean;
  printModeFontSize: number;
  selectedRecipe: Recipe | null;
}

export interface Song {
  title: string;
  artist?: Artist;
  album?: Album;
  lyrics: string[];
  chords?: string[];
  chordFingerings?: Record<string, ChordFingering>;
  transpose?: number;
  permalink?: string;
}

export interface Artist {
  name: string;
  albums?: Album[];
}

export interface Album {
  title: string;
  artist?: Artist;
  songs?: Song[];
  year?: number;
  artwork?: string;
}

export interface ChordFingering {
  frets: number[];
  fingers: number[];
  inversions?: ChordInversion[];
}

export interface ChordInversion {
  frets: number[];
  fingers: number[];
  description: string;
}

export interface Library {
  artists: Artist[];
}

// Recipe-related types
export interface Recipe {
  title: string;
  permalink: string;
  ingredients: Ingredient[];
  instructions: string[];
  servings?: number;
  defaultServings?: number;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  description?: string;
  category?: string;
  tags?: string[];
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  notes?: string;
}

// Redux store types
export interface RootState {
  songs: SongsState;
  chords: ChordsState;
  recipes: RecipesState;
}

export interface UserInfo {
  email: string;
  name: string;
  picture?: string;
}

export type Instrument = 
  | 'ukulele' 
  | 'guitar' 
  | 'piano' 
  | 'bassGuitar' 
  | 'bassUkulele' 
  | 'baritoneUkulele';

// Component prop types
export interface AppProps {
  children?: React.ReactNode;
}

export interface SongDetailProps {
  song: Song;
  artist: Artist;
  onPinChord: (chord: string) => void;
  onUpdateSong: (song: Song) => Promise<void>;
  editingEnabled?: boolean;
}

export interface RecipeDetailProps {
  recipe: Recipe;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  currentView: string;
  onToggleView: () => void;
  editingEnabled?: boolean;
}

// Utility types
export type LoadingState = 'idle' | 'pending' | 'fulfilled' | 'rejected';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Google Drive related types
export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  parents?: string[];
}

export interface GoogleAuthState {
  isSignedIn: boolean;
  userEmail: string | null;
  userName: string | null;
  userPicture: string | null;
}