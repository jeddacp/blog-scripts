function switchMode(mode) {
  const htmlElement = document.documentElement;
  const preferDarkLink = document.getElementById('preferdark');
  const preferLightLink = document.getElementById('preferlight');
  if (mode === 'dark') {
    htmlElement.style.setProperty('color-scheme', 'dark');
    preferDarkLink.style.display = 'none';
    preferLightLink.style.display = 'inline-block';
    localStorage.setItem('theme', 'dark');
  } else {
    htmlElement.style.setProperty('color-scheme', 'light');
    preferDarkLink.style.display = 'inline-block';
    preferLightLink.style.display = 'none';
    localStorage.setItem('theme', 'light');
  }
}
document.addEventListener('DOMContentLoaded', () => {
  const currentAppliedTheme = document.documentElement.style.getPropertyValue('color-scheme');
  if (currentAppliedTheme === 'dark') {
      document.getElementById('preferdark').style.display = 'none';
      document.getElementById('preferlight').style.display = 'inline-block';
  } else {
      document.getElementById('preferdark').style.display = 'inline-block';
      document.getElementById('preferlight').style.display = 'none';
  }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  prefersDark.addEventListener('change', (event) => {
    if (!localStorage.getItem('theme')) {
      if (event.matches) {
        switchMode('dark');
      } else {
        switchMode('light');
      }
    }
  });
});
