# Billy, the Crazy Dog

Platformer no estilo Sonic, em HTML5 Canvas + JavaScript puro.

**Live:** [https://billy.fpoiato.com](https://billy.fpoiato.com)

## Jogar local

Abra `frontend/index.html` no navegador, ou:

```bash
npx --yes serve frontend -p 5173
```

## Layout

| Path | Purpose |
|------|---------|
| `frontend/index.html` | Página do jogo |
| `frontend/js/` | Módulos (player, física, fases, áudio…) |
| `frontend/js/levels/` | Dados de cada fase |
| `infra/terraform/` | S3, CloudFront, ACM, Route53, CodePipeline |
| `pipeline/` | CodeBuild: testa e publica a pasta `frontend/` |
| `.github/workflows/` | CI no PR; deploy no push para `main` |

Fase 1 (Casa + chefão debaixo da cama) está jogável. Fases 2–4 entram depois.
