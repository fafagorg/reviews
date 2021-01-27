# Reviews API for Fafago APP

[![Node.js CI](https://github.com/fafagorg/reviews/workflows/Node.js%20CI/badge.svg?branch=main)](https://github.com/fafagorg/reviews/actions)
[![codecov](https://codecov.io/gh/fafagorg/reviews/branch/main/graph/badge.svg?token=P0V93GNQJI)](https://codecov.io/gh/fafagorg/reviews)
<a href="https://standardjs.com"><img src="https://img.shields.io/badge/code_style-semistandard-brightgreen.svg" alt="Standard - JavaScript Style Guide"></a>
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)


# Introduction.
This is the repository for the reviews API backend that is used in FAFAGO APP, built for the subject "Fundamentos de ingeniería del software para sistemas cloud" from "Máster en Ingeniería del Software: Cloud, Datos y Gestión TI" at University of Seville.

# CI/CD

On branch update [main, dev], if CI passes:
- The server is automatically deployed to Heroku on push to this two branches to maintain two different versions of it:
    - Production: http://reviews.fafago-prod.alexgd.es/docs/
    - Development: http://reviews.fafago-dev.alexgd.es/docs/
- The code is builded and pushed to Docker Hub for test and production images to be updated. A latest version containing the main branch information and a test one with the code from the test branch.
    - https://hub.docker.com/repository/docker/fafagoreviews/reviews