for f in ../*.ttml; do
  node ttml2bcc.js "$f"
done