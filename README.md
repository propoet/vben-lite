##### Tailwind CSS 安装
```shell
pnpm add -D tailwindcss@3 postcss autoprefixer
pnpm exec tailwindcss init -p
```
- pnpm dlx tailwindcss init -p  没安装，只想生成配置, 建议使用 pnpm exec(项目级标准入口) 命令
- -p生成postcss.config.js



- 在一个基础的 vue3+vite 非monorepo 单体后端管理系统项目,要实现vben中的 "xxx" 功能;
- 项目中已经有tailwindcss,eslint prettier 常量 等配置;
- 以下是项目结构(如果现有结构与vben不一致,请按照vben的结构调整)

vben-lite/
├── .vscode/                          # VS Code 配置
│   ├── extensions.json              # 推荐扩展列表
│   └── settings.json                # 编辑器设置（格式化、ESLint）
│
├── .idea/                            # IDE 配置（可选）
│   └── .gitignore
│
├── node_modules/                     # 依赖包（忽略）
│
├── public/                           # 静态资源目录
│   └── vite.svg                     # Vite 图标
│
├── src/                              # 源代码目录
│   ├── App.vue                      # 根组件
│   ├── main.ts                      # 应用入口文件
│   │
│   ├── components/                  # 可复用组件目录（空）
│   │
│   ├── constants/                   # 应用常量
│   │   ├── core.ts                  # 核心常量
│   │   └── index.ts                 # 常量导出
│   │
│   ├── shared/                      # 共享资源
│   │   └── constants/               # 共享常量
│   │       ├── globals.ts           # 全局常量
│   │       ├── index.ts             # 导出文件
│   │       └── vben.ts              # Vben 相关常量
│   │
│   ├── styles/                      # 样式文件
│   │   └── index.css                # 全局样式入口
│   │
│   ├── types/                       # TypeScript 类型定义
│   │   └── index.ts                 # 类型定义导出
│   │
│   ├── utils/                       # 工具函数
│   │   └── index.ts                 # 工具函数导出
│   │
│   └── views/                       # 页面视图组件
│       ├── _core/                   # 核心页面
│       │   ├── authentication/      # 认证相关页面
│       │   │   └── placeholder.txt
│       │   └── fallback/            # 错误/降级页面
│       │       └── placeholder.txt
│       └── dashboard/               # 仪表盘页面
│           └── placeholder.txt
│
├── .gitignore                        # Git 忽略规则
├── .prettierrc.json                  # Prettier 格式化配置
├── eslint.config.js                  # ESLint 代码检查配置
├── index.html                        # HTML 入口文件
├── package.json                      # 项目配置和依赖
├── pnpm-lock.yaml                   # pnpm 依赖锁定文件
├── postcss.config.js                # PostCSS 配置
├── README.md                         # 项目说明文档
├── tailwind.config.js               # Tailwind CSS 配置
├── tsconfig.json                     # TypeScript 主配置
├── tsconfig.app.json                 # TypeScript 应用配置
└── vite.config.ts                    # Vite 构建工具配置


- 要求代码与vben代码完全一致, 不要简化, 不要省略,不要自己发挥,完全按照vben的实现方式;
- 讲透原理;
- 从0开始这个功能, 包括在什么位置创建什么文件,引入什么三方库,三方库作用;
- 有任何依赖的其他模块,一块实现;
- 给出vben代码,一步一步实现,循序渐进,每步可以测试, 最终实现功能; 
- 最后实现完后,检查代码与vben是否完全一致;是否有遗漏的模块, 如果不一致或缺失, 修改到完全一致;
- 将上述过程写成文档, 包括代码和注释;