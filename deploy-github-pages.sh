echo Creating branch...
git checkout --orphan gh-pages

echo Building...
git --work-tree ./out add --all
git --work-tree ./out commit -m gh-pages

echo Pushing to gh-pages...
git push origin HEAD:gh-pages --force
git checkout -f main
git branch -D gh-pages

echo Successfully deployed!
