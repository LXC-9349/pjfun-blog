---
title: Kotlin Multiplatform 跨平台开发实战
date: 2026-05-17
cover: https://picsum.photos/seed/kmp-cross-platform/800/400
desc: 使用 Kotlin Multiplatform 一套代码构建 iOS、Android、Web 多端应用
tags: [Kotlin, 跨平台, 移动开发, Android]
---

## 什么是 Kotlin Multiplatform

Kotlin Multiplatform (KMP) 允许你用 Kotlin 编写共享的业务逻辑，然后在不同平台（Android、iOS、Web、Desktop）上运行。与 Flutter/React Native 不同，KMP 共享的是逻辑层，UI 层仍然使用各平台的原生方案。

### KMP vs 其他跨平台方案

| 方案 | 共享内容 | UI 方案 | 性能 | 学习曲线 |
|------|---------|---------|------|---------|
| KMP | 业务逻辑 | 原生 UI | 原生 | 中 |
| Flutter | 全部 | Flutter 渲染 | 接近原生 | 中 |
| React Native | 全部 | 原生组件桥接 | 良好 | 低（前端背景） |
| Compose Multiplatform | 全部 | Compose 渲染 | 良好 | 中 |

## 核心概念

### 共享模块结构

```
shared/
├── src/
│   ├── commonMain/        # 共享代码
│   │   ├── kotlin/
│   │   │   ├── data/      # 数据模型
│   │   │   ├── domain/    # 业务逻辑
│   │   │   └── network/   # 网络请求
│   │   └── resources/
│   ├── androidMain/       # Android 特定代码
│   │   └── kotlin/
│   └── iosMain/           # iOS 特定代码
│       └── kotlin/
└── build.gradle.kts
```

### 预期与实际（Expect/Actual）

```kotlin
// commonMain - 声明预期
expect class Platform {
    val name: String
    fun getDeviceInfo(): String
}

// androidMain - Android 实际实现
actual class Platform {
    actual val name: String = "Android"
    actual fun getDeviceInfo(): String = 
        "SDK ${android.os.Build.VERSION.SDK_INT}"
}

// iosMain - iOS 实际实现
actual class Platform {
    actual val name: String = "iOS"
    actual fun getDeviceInfo(): String = 
        UIDevice.currentDevice.systemVersion()
}
```

## 项目搭建

### Gradle 配置

```kotlin
// shared/build.gradle.kts
plugins {
    kotlin("multiplatform")
    kotlin("plugin.serialization")
    id("com.android.library")
}

kotlin {
    androidTarget()
    
    listOf(
        iosX64(),
        iosArm64(),
        iosSimulatorArm64()
    ).forEach {
        it.binaries.framework {
            baseName = "shared"
            isStatic = true
        }
    }
    
    sourceSets {
        commonMain.dependencies {
            api("io.ktor:ktor-client-core:2.3.7")
            api("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.2")
            api("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
            api("co.touchlab:sqliter-driver:1.2.3")
        }
        
        androidMain.dependencies {
            implementation("io.ktor:ktor-client-okhttp:2.3.7")
        }
        
        iosMain.dependencies {
            implementation("io.ktor:ktor-client-darwin:2.3.7")
        }
    }
}
```

## 网络层

### 使用 Ktor Client

```kotlin
// commonMain/kotlin/network/ApiClient.kt
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.Json

class ApiClient {
    private val client = HttpClient {
        install(ContentNegotiation) {
            json(Json {
                ignoreUnknownKeys = true
                isLenient = true
            })
        }
    }
    
    suspend fun getArticles(): List<Article> {
        return client.get("https://api.example.com/articles")
            .body<List<Article>>()
    }
    
    suspend fun getArticle(id: String): Article {
        return client.get("https://api.example.com/articles/$id")
            .body<Article>()
    }
}
```

### 数据模型

```kotlin
// commonMain/kotlin/data/Article.kt
import kotlinx.serialization.Serializable

@Serializable
data class Article(
    val id: String,
    val title: String,
    val content: String,
    val author: String,
    val createdAt: String,
    val tags: List<String> = emptyList(),
)

@Serializable
data class ApiResponse<T>(
    val data: T,
    val message: String? = null,
)
```

## 数据库层

### 使用 SQLDelight

```kotlin
// commonMain/kotlin/data/Database.kt
import app.cash.sqldelight.db.SqlDriver
import com.example.shared.database.ArticleDatabase
import com.example.shared.database.Articles

class LocalDatabase(driver: SqlDriver) {
    private val db = ArticleDatabase(driver)
    private val queries = db.articlesQueries
    
    suspend fun insertArticle(article: Article) {
        queries.insertArticle(
            id = article.id,
            title = article.title,
            content = article.content,
            author = article.author,
            created_at = article.createdAt,
        )
    }
    
    fun getAllArticles(): List<Articles> {
        return queries.selectAll().executeAsList()
    }
    
    fun getArticle(id: String): Articles? {
        return queries.selectById(id).executeAsOneOrNull()
    }
}
```

### 平台特定数据库驱动

```kotlin
// androidMain
fun createDriver(context: Context): SqlDriver {
    return AndroidSqliteDriver(ArticleDatabase.Schema, context, "app.db")
}

// iosMain
fun createDriver(): SqlDriver {
    return NativeSqliteDriver(ArticleDatabase.Schema, "app.db")
}
```

## 状态管理

### 使用 ViewModel 模式

```kotlin
// commonMain/kotlin/viewmodel/ArticleViewModel.kt
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class ArticleViewModel(
    private val repository: ArticleRepository,
    private val scope: CoroutineScope
) {
    private val _articles = MutableStateFlow<List<Article>>(emptyList())
    val articles: StateFlow<List<Article>> = _articles
    
    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading
    
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error
    
    init {
        loadArticles()
    }
    
    fun loadArticles() {
        scope.launch {
            _loading.value = true
            _error.value = null
            try {
                _articles.value = repository.getArticles()
            } catch (e: Exception) {
                _error.value = e.message
            } finally {
                _loading.value = false
            }
        }
    }
    
    fun refresh() {
        scope.launch {
            repository.refresh()
            loadArticles()
        }
    }
}
```

## Android 端集成

```kotlin
// androidApp/src/main/java/MainActivity.kt
class MainActivity : ComponentActivity() {
    private val viewModel: ArticleViewModel by viewModels {
        ArticleViewModelFactory(
            repository = ArticleRepository(
                apiClient = ApiClient(),
                localDatabase = LocalDatabase(createDriver(this))
            ),
            scope = viewModelScope
        )
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                ArticleListScreen(
                    articles = viewModel.articles.collectAsState().value,
                    loading = viewModel.loading.collectAsState().value,
                    onRefresh = { viewModel.refresh() }
                )
            }
        }
    }
}
```

## iOS 端集成

```swift
// iOS App/ContentView.swift
import SwiftUI
import shared

struct ContentView: View {
    @StateObject private var viewModel: ArticleViewModel
    
    init() {
        let repository = ArticleRepository(
            apiClient: ApiClient(),
            localDatabase: LocalDatabase(driver: DatabaseKt.createDriver())
        )
        _viewModel = StateObject(wrappedValue: ArticleViewModel(
            repository: repository,
            scope: Kotlinx_coroutines_coreMainKt.MainScope()
        ))
    }
    
    var body: some View {
        NavigationView {
            ArticleListView(viewModel: viewModel)
                .navigationTitle("文章")
        }
    }
}
```

## 测试

### 共享测试

```kotlin
// commonTest/kotlin/ArticleRepositoryTest.kt
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlinx.coroutines.test.runTest

class ArticleRepositoryTest {
    @Test
    fun `getArticles returns cached data when available`() = runTest {
        val localDb = MockLocalDatabase()
        localDb.insertArticle(testArticle)
        
        val repository = ArticleRepository(localDb, MockApiClient())
        val articles = repository.getArticles()
        
        assertEquals(1, articles.size)
        assertEquals(testArticle.title, articles[0].title)
    }
}
```

## 最佳实践

| 实践 | 说明 |
|------|------|
| 共享逻辑，不共享 UI | 业务逻辑共享，UI 用原生实现 |
| 使用协程 | 异步操作统一用 Kotlin 协程 |
| 依赖注入 | 方便测试和平台特定实现替换 |
| 平台特定代码隔离 | 用 expect/actual 或依赖注入隔离 |
| 共享测试 | 在 commonTest 中编写共享测试 |

## 总结

KMP 的核心优势：

1. **类型安全**——编译时检查，减少运行时错误
2. **原生性能**——UI 层使用原生方案
3. **渐进式采用**——可以在现有项目中逐步引入
4. **Kotlin 生态**——协程、序列化、Ktor 等成熟库

对于已有 Android 开发经验的团队，KMP 是扩展 iOS 的最佳路径。
