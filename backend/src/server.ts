import app from './app.ts';

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`🚀 Inspector API running on http://localhost:${port}`));

