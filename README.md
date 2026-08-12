# Billy, the crazy dog

Platformer no estilo Sonic, rodando no browser.

**Live:** [https://billy.fpoiato.com](https://billy.fpoiato.com)

## Layout

| Path | Purpose |
|------|---------|
| `frontend/` | Vite + TypeScript + Canvas |
| `infra/terraform/` | S3, CloudFront (OAC), ACM, Route53, CodePipeline |
| `pipeline/` | CodeBuild buildspec |
| `.github/workflows/` | CI no PR; deploy no push para `main` |

## Local

```bash
unset NPM_TOKEN NODE_AUTH_TOKEN
npm ci
npm start
```

Abre `http://localhost:5173`.

## Infra

```bash
cd infra/terraform
cp example.tfvars terraform.tfvars
terraform init
terraform apply -var-file=terraform.tfvars
```

No repo `fpoiato/billy`, defina a variable `AWS_GITHUB_ACTIONS_ROLE_ARN` com o output `github_actions_role_arn`.

Todo push em `main` sobe um zip para o S3 de source e dispara o CodePipeline (build → S3 sync → invalidação do CloudFront).
