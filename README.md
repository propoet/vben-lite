##### Tailwind CSS 安装
```shell
pnpm add -D tailwindcss@3 postcss autoprefixer
pnpm exec tailwindcss init -p
```
- pnpm dlx tailwindcss init -p  没安装，只想生成配置, 建议使用 pnpm exec(项目级标准入口) 命令
- -p生成postcss.config.js