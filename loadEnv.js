import fs from 'fs'

if (fs.existsSync('env.json')) {
  try {
    const envConfig = JSON.parse(fs.readFileSync('env.json', 'utf8'));
    Object.keys(envConfig).forEach(key => {
      process.env[key] = envConfig[key];
    });
    console.log('Loaded env.json');
  } catch (e) {
    console.error('Failed to load env.json', e);
  }
} else {
  console.log('No env.json found, using process.env');
}