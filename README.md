# smartui-github-testing

For Testing Github App Integration with SmartUI



### Getting Started Github App Integration with SmartUI Product - Selenium Automation

Steps 1: Setup Github App with lambdatest from link github setup

- Using OAuth

- Cloud, or

- Self Hosted

Step 2: Once setup is done, you will see like 

Step 3: Now you need to setup a sample repository where your test case are mentioned, [smartui-github-testing](https://github.com/LambdaTest/smartui-github-testing)

Step 4: For Github Status updates on PR/ commit need to add capabilities in test suite,

```
    github: {
      "url": "https://api.github.com/repos/OWNER/REPO/statuses/commitId",
      "owner": "{OWNER}",  //Optional
      "repo": "{REPO}",  //Optional
      "commit": "{commitId}" //Optional
    },
```

Step5: How to get the `github.url`  value in test suite

Here we have taken an example of github action, Add below steps in your github action file [.github/workflows/ci.yml](https://github.com/LambdaTest/smartui-github-testing/blob/main/.github/workflows/ci.yml)

```
    name: Execute SmartUI Test with Github App Integration
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1

    - name: Create commit status
      run: |
        API_HOST=https://api.github.com
        # Check out the PR branch
        git checkout $GITHUB_HEAD_REF
        # Get the commit ID of the last commit
        COMMIT_ID=$(git rev-parse HEAD)
        echo "Last commit ID of PR: $COMMIT_ID"
        GITHUB_URL=$API_HOST/repos/$GITHUB_REPOSITORY/statuses/$COMMIT_ID
        echo "GITHUB_URL: $GITHUB_URL"
        echo "GITHUB_URL=$GITHUB_URL" >> $GITHUB_ENV
```


Step 6: Commit you changes over git on a branch and raise the PR to main branch

Step 7: Now you will see the `lambdatest-smartui-app` check in the PR

