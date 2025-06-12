// stepColors.js
// ROYGBIV color scheme for knitting design steps

export const STEP_COLORS = {
  0: { name: 'Red', primary: '#ff4d4f', secondary: '#ff7875' },      // Pattern Setup
  1: { name: 'Orange', primary: '#fa8c16', secondary: '#ffa940' },   // Pattern Editor
  2: { name: 'Yellow', primary: '#fadb14', secondary: '#ffec3d' },   // Sizing
  3: { name: 'Green', primary: '#52c41a', secondary: '#73d13d' },    // Gauge
  4: { name: 'Blue', primary: '#1890ff', secondary: '#40a9ff' },     // Colorwork
  5: { name: 'Indigo', primary: '#722ed1', secondary: '#9254de' },   // Preview
  6: { name: 'Violet', primary: '#eb2f96', secondary: '#f759ab' }    // Interactive Knitting
};

// Get the color for a specific step
export const getStepColor = (stepIndex) => {
  return STEP_COLORS[stepIndex] || STEP_COLORS[0];
};

// Helper function to lighten a hex color
const lightenColor = (hex, percent) => {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
};

// Helper function to darken a hex color
const darkenColor = (hex, percent) => {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = (num >> 8 & 0x00FF) - amt;
  const B = (num & 0x0000FF) - amt;
  return '#' + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
    (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
    (B > 255 ? 255 : B < 0 ? 0 : B) * 0x100).toString(16).slice(1);
};

// Create a gradient using lighter and darker shades of the target step's color
export const createStepGradient = (fromStep, toStep) => {
  const targetColor = getStepColor(toStep);
  const lightShade = lightenColor(targetColor.primary, 15);
  const darkShade = darkenColor(targetColor.primary, 15);
  
  return `linear-gradient(135deg, ${lightShade}, ${targetColor.primary}, ${darkShade})`;
};

// Generate CSS for gradient button
export const getGradientButtonStyle = (fromStep, toStep, disabled = false) => {
  if (disabled) {
    return {
      background: '#f5f5f5',
      borderColor: '#d9d9d9',
      color: '#00000040'
    };
  }
  
  const gradient = createStepGradient(fromStep, toStep);
  
  return {
    background: gradient,
    borderColor: 'transparent',
    color: 'white',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };
};

// Generate hover effects for gradient buttons
export const getGradientButtonHoverStyle = (fromStep, toStep) => {
  const fromColor = getStepColor(fromStep);
  const toColor = getStepColor(toStep);
  
  return {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    filter: 'brightness(1.1)'
  };
};
