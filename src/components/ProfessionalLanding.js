import React, { useEffect } from 'react';
import './ProfessionalLanding.critical.css';
import '../ProfessionalLanding.css';

const ProfessionalLanding = () => {
    useEffect(() => {
        // Register service worker for caching
        const registerServiceWorker = () => {
            if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
                navigator.serviceWorker.register('/sw.js')
                  .then((registration) => {
                    console.log('SW registered: ', registration);
                  })
                  .catch((registrationError) => {
                    console.log('SW registration failed: ', registrationError);
                  });
            }
        };
        
        // Register service worker after a short delay
        const timer = setTimeout(registerServiceWorker, 100);
        
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="css-1jmej02">
            <div className="css-18dmi9v">
                <img src="https://s.gravatar.com/userimage/244664585/f7a5e0c9518c7c7c176fb815ca4bd846.jpeg?size=56" alt="" aria-hidden="true" className="css-liixgw" />
                <h1 className="css-17ahnq4">Wade Ahlstrom</h1>
                <p className="css-so0bfi">Software Engineer</p>
                <div className="css-gmuwbf">
                    <div className="css-social-link">
                        <a href="Wade_Mauger_Resume_7_24.pdf" title="Resume" target="_blank" rel="noreferrer noopener" className="css-combined-link">
                            <svg viewBox="0 0 24 24" role="presentation" aria-hidden="true" className="css-kqzqgg" style={{ width: '3.2rem', height: '3.2rem' }}>
                                <path d="M13,9H18.5L13,3.5V9M6,2H14L20,8V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V4C4,2.89 4.89,2 6,2M14,20V19C14,17.67 11.33,17 10,17C8.67,17 6,17.67 6,19V20H14M10,12A2,2 0 0,0 8,14A2,2 0 0,0 10,16A2,2 0 0,0 12,14A2,2 0 0,0 10,12Z" style={{ fill: '#556873' }} />
                            </svg>
                            <span className="css-link-label">[resume]</span>
                        </a>
                    </div>
                    <div className="css-social-link">
                        <a href="https://github.com/wademauger" title="Github" target="_blank" rel="noreferrer noopener" className="css-combined-link">
                            <svg viewBox="0 0 24 24" role="presentation" aria-hidden="true" className="css-kqzqgg" style={{ width: '3.2rem', height: '3.2rem' }}>
                                <path d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z" style={{ fill: '#556873' }} />
                            </svg>
                            <span className="css-link-label">[github]</span>
                        </a>
                    </div>
                    <div className="css-social-link">
                        <a href="https://www.linkedin.com/in/wadeanthony0100" title="LinkedIn" target="_blank" rel="noreferrer noopener" className="css-combined-link">
                            <svg viewBox="0 0 24 24" role="presentation" aria-hidden="true" className="css-kqzqgg" style={{ width: '3.2rem', height: '3.2rem' }}>
                                <path d="M19,3A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3H19M18.5,18.5V13.2A3.26,3.26 0 0,0 15.24,9.94C14.39,9.94 13.4,10.46 12.92,11.24V10.13H10.13V18.5H12.92V13.57C12.92,12.8 13.54,12.17 14.31,12.17A1.4,1.4 0 0,1 15.71,13.57V18.5H18.5M6.88,8.56A1.68,1.68 0 0,0 8.56,6.88C8.56,5.95 7.81,5.19 6.88,5.19A1.69,1.69 0 0,0 5.19,6.88C5.19,7.81 5.95,8.56 6.88,8.56M8.27,18.5V10.13H5.5V18.5H8.27Z" style={{ fill: '#556873' }} />
                            </svg>
                            <span className="css-link-label">[linkedin]</span>
                        </a>
                    </div>
                    <div className="css-social-link">
                        <a href="mailto:wadeanthony0100@gmail.com" title="email" target="_blank" rel="noreferrer noopener" className="css-combined-link">
                            <svg viewBox="0 0 24 24" role="presentation" aria-hidden="true" className="css-kqzqgg" style={{ width: '3.2rem', height: '3.2rem' }}>
                                <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" style={{ fill: '#556873' }} />
                            </svg>
                            <span className="css-link-label">[email]</span>
                        </a>
                    </div>

                    <div className="css-social-link">
                        <a href="/#/crafts" title="Creative Projects" className="css-combined-link">
                            <svg version="1.0" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" className="css-kqzqgg" style={{ width: '3.2rem', height: '3.2rem', color: '#556873' }} viewBox="0 0 475.000000 475.000000">
                                <g transform="translate(0.000000,762.000000) scale(0.100000,-0.100000)" stroke="none">
                                    <path d="M1445 7166 c-155 -36 -314 -120 -501 -265 -90 -70 -257 -211 -266 -225 -4 -6 -8 -50 -8 -97 l0 -87 -37 -36 c-21 -20 -40 -36 -44 -36 -4 0 -23 7 -44 16 -55 23 -106 11 -163 -38 -100 -86 -193 -180 -190 -193 6 -24 457 -497 470 -493 18 7 212 195 229 222 22 35 24 88 7 136 -11 32 -10 34 33 72 82 72 102 70 223 -21 37 -29 74 -51 81 -49 13 3 405 366 405 374 0 3 -21 31 -46 61 -94 117 -105 169 -47 233 69 78 236 141 555 210 178 38 178 38 178 55 0 20 -211 93 -425 146 -105 27 -325 34 -410 15z" />
                                    <path d="M3634 6960 c-84 -12 -151 -39 -227 -90 -166 -111 -261 -308 -243 -504 l6 -71 -97 -89 c-54 -49 -204 -189 -333 -312 -129 -122 -250 -234 -267 -249 -18 -15 -33 -33 -33 -40 0 -7 87 -102 193 -210 l192 -196 290 272 c160 149 324 304 366 344 l76 73 44 -9 c181 -35 362 22 495 155 82 82 125 161 150 273 22 99 11 261 -17 251 -10 -4 -209 -187 -336 -309 -50 -49 -98 -89 -105 -89 -13 0 -247 86 -255 93 -6 7 -73 242 -73 259 0 9 6 21 14 25 7 4 80 71 162 149 82 77 173 162 201 188 29 27 50 52 47 57 -14 23 -170 42 -250 29z" />
                                    <path d="M1477 6218 c-81 -77 -147 -144 -147 -150 0 -9 140 -170 295 -338 33 -36 101 -110 150 -165 50 -55 137 -152 195 -215 149 -164 160 -176 330 -365 84 -93 190 -210 236 -260 45 -49 151 -167 235 -261 85 -94 215 -237 289 -318 74 -82 180 -199 235 -260 169 -191 457 -507 525 -579 50 -52 74 -70 105 -77 70 -16 103 1 227 116 198 184 202 222 43 386 -49 51 -362 372 -695 713 -332 341 -780 800 -995 1020 -214 220 -476 488 -581 595 -105 107 -208 215 -230 238 -21 24 -46 48 -55 52 -12 7 -51 -25 -162 -132z" />
                                    <path d="M1839 5050 c-101 -96 -258 -243 -349 -329 -91 -85 -202 -190 -247 -233 l-83 -79 -57 8 c-135 19 -298 -13 -395 -77 -116 -77 -216 -222 -239 -345 -11 -59 -8 -249 4 -262 4 -3 32 19 64 49 32 30 131 123 220 207 l162 152 128 -46 c70 -26 129 -48 131 -50 10 -10 79 -262 74 -270 -4 -6 -72 -71 -151 -145 -80 -74 -176 -165 -215 -201 l-71 -67 45 -13 c74 -22 233 -18 312 9 239 82 389 303 375 554 l-4 86 126 118 c69 64 160 149 201 188 41 40 178 168 303 285 125 118 226 217 225 221 -3 9 -232 262 -319 354 l-56 59 -184 -173z" />
                                </g>
                            </svg>
                            <span className="css-link-label">[projects]</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfessionalLanding;