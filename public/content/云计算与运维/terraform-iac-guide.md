---
title: Terraform 基础设施即代码实战指南
date: 2026-05-17
cover: https://picsum.photos/seed/terraform-iac/800/400
desc: 从基础概念到生产实践，掌握使用 Terraform 管理云基础设施的方法
tags: [Terraform, IaC, 云计算, 运维]
---

## 什么是基础设施即代码

基础设施即代码（IaC）是用代码来定义和管理基础设施。Terraform 是最流行的 IaC 工具，它允许你用声明式语言描述你想要的云资源状态，然后自动创建和管理它们。

## 为什么选择 Terraform

| 优势 | 说明 |
|------|------|
| 多云支持 | AWS、Azure、GCP、阿里云等 200+ 提供商 |
| 声明式语言 | 描述"想要什么"，而不是"怎么做" |
| 状态管理 | 跟踪实际资源状态，支持增量更新 |
| 模块化 | 可复用的模块，减少重复代码 |
| 计划预览 | apply 前可以预览变更 |

## 核心概念

### 工作流程

```
编写配置 (.tf) → terraform init → terraform plan → terraform apply
```

### 核心组件

```
Provider（提供商）   → AWS、Azure、GCP 等
Resource（资源）     → EC2、S3、RDS 等
Module（模块）       → 可复用的资源组合
State（状态）        → 记录实际资源状态
Variable（变量）     → 参数化配置
Output（输出）       → 暴露资源属性
```

## 快速开始

### 安装

```bash
# macOS
brew install hashicorp/tap/terraform

# Windows (Scoop)
scoop install terraform

# 验证安装
terraform version
```

### 第一个 Terraform 配置

```hcl
# main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  required_version = ">= 1.5.0"
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
  
  tags = {
    Name        = "web-server"
    Environment = "production"
  }
}
```

### 执行流程

```bash
# 1. 初始化（下载 provider 插件）
terraform init

# 2. 预览变更（不会实际执行）
terraform plan

# 3. 应用变更（创建资源）
terraform apply

# 4. 查看状态
terraform show

# 5. 销毁资源
terraform destroy
```

## 变量与输出

### 变量定义

```hcl
# variables.tf
variable "instance_type" {
  description = "EC2 实例类型"
  type        = string
  default     = "t3.micro"
  
  validation {
    condition     = contains(["t3.micro", "t3.small", "t3.medium"], var.instance_type)
    error_message = "实例类型必须是 t3.micro、t3.small 或 t3.medium。"
  }
}

variable "environment" {
  description = "环境名称"
  type        = string
  default     = "dev"
}

variable "enable_monitoring" {
  description = "是否启用监控"
  type        = bool
  default     = true
}
```

### 使用变量

```hcl
resource "aws_instance" "web" {
  ami           = data.aws_ami.latest.id
  instance_type = var.instance_type
  
  tags = {
    Name        = "${var.environment}-web-server"
    Environment = var.environment
  }
}
```

### 输出

```hcl
# outputs.tf
output "instance_public_ip" {
  description = "Web 服务器的公网 IP"
  value       = aws_instance.web.public_ip
}

output "instance_id" {
  description = "EC2 实例 ID"
  value       = aws_instance.web.id
}
```

## 状态管理

### 本地状态 vs 远程状态

```hcl
# 远程状态（推荐用于团队协作）
terraform {
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"  # 状态锁
    encrypt        = true
  }
}
```

### 状态操作

```bash
# 查看状态
terraform state list

# 查看资源详情
terraform state show aws_instance.web

# 导入已有资源
terraform import aws_instance.web i-1234567890abcdef0

# 移除状态中的资源（不删除实际资源）
terraform state rm aws_instance.web
```

## 模块化

### 创建模块

```
modules/
└── vpc/
    ├── main.tf
    ├── variables.tf
    └── outputs.tf
```

```hcl
# modules/vpc/main.tf
resource "aws_vpc" "this" {
  cidr_block = var.cidr_block
  
  tags = {
    Name = var.name
  }
}

resource "aws_subnet" "public" {
  count             = length(var.public_subnet_cidrs)
  vpc_id            = aws_vpc.this.id
  cidr_block        = var.public_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]
}
```

```hcl
# modules/vpc/variables.tf
variable "name" {
  type = string
}

variable "cidr_block" {
  type = string
}

variable "public_subnet_cidrs" {
  type = list(string)
}

variable "availability_zones" {
  type = list(string)
}
```

### 使用模块

```hcl
module "vpc" {
  source = "./modules/vpc"
  
  name               = "main-vpc"
  cidr_block         = "10.0.0.0/16"
  public_subnet_cidrs = ["10.0.1.0/24", "10.0.2.0/24"]
  availability_zones = ["us-east-1a", "us-east-1b"]
}

output "vpc_id" {
  value = module.vpc.vpc_id
}
```

## 实战：完整 Web 应用基础设施

```hcl
# main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket = "my-terraform-state"
    key    = "webapp/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.region
}

# VPC
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"
  
  name = "webapp-vpc"
  cidr = "10.0.0.0/16"
  
  azs             = ["${var.region}a", "${var.region}b"]
  public_subnets  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnets = ["10.0.10.0/24", "10.0.20.0/24"]
  
  enable_nat_gateway = true
}

# RDS
resource "aws_db_instance" "main" {
  identifier     = "webapp-db"
  engine         = "postgres"
  engine_version = "16.1"
  instance_class = "db.t3.medium"
  
  allocated_storage = 20
  storage_type      = "gp3"
  
  db_name  = "webapp"
  username = var.db_username
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.db.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  skip_final_snapshot = true
}

# ECS (容器服务)
resource "aws_ecs_cluster" "main" {
  name = "webapp-cluster"
}

resource "aws_ecs_task_definition" "web" {
  family                   = "webapp"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  
  container_definitions = jsonencode([{
    name  = "web"
    image = var.app_image
    portMappings = [{
      containerPort = 3000
      protocol      = "tcp"
    }]
    environment = [
      { name = "DATABASE_URL", value = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.main.endpoint}/webapp" }
    ]
  }])
}

# ALB (负载均衡)
resource "aws_lb" "web" {
  name               = "webapp-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = module.vpc.public_subnet_ids
}

resource "aws_lb_listener" "web" {
  load_balancer_arn = aws_lb.web.arn
  port              = 80
  protocol          = "HTTP"
  
  default_action {
    type = "forward"
    target_group_arn = aws_lb_target_group.web.arn
  }
}
```

## 最佳实践

### 目录结构

```
infrastructure/
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── terraform.tfvars
│   ├── staging/
│   │   └── ...
│   └── production/
│       └── ...
├── modules/
│   ├── vpc/
│   ├── ecs/
│   └── rds/
└── .terraform.lock.hcl
```

### CI/CD 集成

```yaml
# .github/workflows/terraform.yml
name: Terraform
on:
  push:
    branches: [main]
  pull_request:

jobs:
  terraform:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
      
      - name: Terraform Init
        run: terraform init
      
      - name: Terraform Format
        run: terraform fmt -check
      
      - name: Terraform Validate
        run: terraform validate
      
      - name: Terraform Plan
        run: terraform plan -out=tfplan
      
      - name: Terraform Apply
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        run: terraform apply tfplan
```

### 安全建议

| 实践 | 说明 |
|------|------|
| 状态加密 | S3 后端启用加密 |
| 状态锁 | 使用 DynamoDB 防止并发冲突 |
| 敏感变量 | 使用 `sensitive = true` 标记 |
| 最小权限 | Terraform 执行角色使用最小权限策略 |
| 代码审查 | 所有变更通过 PR 审查 |

## 总结

Terraform 的核心价值：

1. **声明式**——描述目标状态，Terraform 自动达成
2. **可版本控制**——基础设施变更可以 code review
3. **可重复**——相同配置在任何环境创建相同资源
4. **模块化**——复用基础设施模式

掌握 Terraform 后，你的基础设施管理将从"手动操作"升级为"代码驱动"。
