/**
 * 将字符串的首字母大写
 * 
 * 使用场景：
 * - 格式化用户输入（如姓名、标题等）
 * - 将普通字符串转换为类名或组件名（如 "button" -> "Button"）
 * - 处理API返回的数据格式化（如状态码转状态名称）
 * - 生成符合命名规范的标识符
 * 
 * 原理：
 * 1. 使用 charAt(0) 获取字符串的第一个字符
 * 2. 使用 toUpperCase() 将首字母转换为大写
 * 3. 使用 slice(1) 获取从第二个字符开始的所有字符（保持原样）
 * 4. 将大写首字母与剩余部分拼接
 * 
 * 优点：
 * - 实现简单，性能高效
 * - 只改变首字母，不影响其他字符
 * - 对空字符串安全（返回空字符串）
 * 
 * 示例：
 * - capitalizeFirstLetter('hello') => 'Hello'
 * - capitalizeFirstLetter('world') => 'World'
 * - capitalizeFirstLetter('') => ''
 * 
 * @param string - 要转换的字符串
 * @returns 首字母大写的字符串
 */
function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * 将字符串的首字母转换为小写
 * 
 * 使用场景：
 * - 将类名转换为实例名（如 "UserService" -> "userService"）
 * - 处理驼峰命名转换（配合其他转换函数使用）
 * - 格式化从后端返回的字段名（如 "UserName" -> "userName"）
 * - 将PascalCase转换为camelCase
 * - 处理可能包含大写首字母的用户输入
 * 
 * 原理：
 * 1. 首先检查字符串是否为空，如果为空直接返回（避免错误）
 * 2. 使用 charAt(0) 获取字符串的第一个字符
 * 3. 使用 toLowerCase() 将首字母转换为小写
 * 4. 使用 slice(1) 获取从第二个字符开始的所有字符（保持原样）
 * 5. 将小写首字母与剩余部分拼接
 * 
 * 优点：
 * - 对空字符串和null/undefined安全处理
 * - 只改变首字母，不影响其他字符的大小写
 * - 实现简单，性能高效
 * 
 * 示例：
 * - toLowerCaseFirstLetter('Hello') => 'hello'
 * - toLowerCaseFirstLetter('World') => 'world'
 * - toLowerCaseFirstLetter('') => ''
 * - toLowerCaseFirstLetter('UserName') => 'userName'
 * 
 * @param str - 要转换的字符串
 * @returns 首字母小写的字符串
 */
function toLowerCaseFirstLetter(str: string): string {
  if (!str) return str; // 如果字符串为空，直接返回
  return str.charAt(0).toLowerCase() + str.slice(1);
}

/**
 * 生成驼峰命名法的键名（组合父键和子键）
 * 
 * 使用场景：
 * - 构建嵌套对象的键名（如配置对象、表单字段名）
 * - 将扁平结构转换为嵌套结构的键名（如 "user.name" -> "userName"）
 * - 处理API响应数据的键名转换
 * - 生成符合JavaScript命名规范的组合键名
 * - 处理表单字段的嵌套命名（如 "form.userName"）
 * 
 * 原理：
 * 1. 如果 parentKey 为空，直接返回 key（无需组合）
 * 2. 如果 parentKey 存在：
 *    - 将 parentKey 作为前缀（保持原样，通常已经是小写开头）
 *    - 将 key 的首字母转换为大写（使用 charAt(0).toUpperCase()）
 *    - 将 key 的剩余部分保持原样（使用 slice(1)）
 *    - 拼接成驼峰命名格式：parentKey + 首字母大写的key
 * 
 * 优点：
 * - 自动处理空父键的情况
 * - 生成的键名符合JavaScript驼峰命名规范
 * - 适合构建嵌套对象的键名
 * 
 * 示例：
 * - toCamelCase('name', 'user') => 'userName'
 * - toCamelCase('firstName', 'user') => 'userFirstName'
 * - toCamelCase('email', '') => 'email'
 * - toCamelCase('address', 'user') => 'userAddress'
 * 
 * 注意事项：
 * - parentKey 应该是小写开头的驼峰命名（如 "user"）
 * - 如果 parentKey 本身是大写开头，结果可能不符合标准驼峰命名
 * 
 * @param key - 子键名（将被转换为首字母大写）
 * @param parentKey - 父键名（作为前缀，如果为空则直接返回key）
 * @returns 组合后的驼峰命名键名
 */
function toCamelCase(key: string, parentKey: string): string {
  if (!parentKey) {
    return key;
  }
  return parentKey + key.charAt(0).toUpperCase() + key.slice(1);
}

/**
 * 将短横线命名（kebab-case）转换为驼峰命名（camelCase）
 * 
 * 使用场景：
 * - 将CSS类名转换为JavaScript变量名（如 "my-button" -> "myButton"）
 * - 处理HTML属性名转换为对象属性名（如 "data-user-id" -> "dataUserId"）
 * - 转换API返回的短横线命名字段为驼峰命名（如 "user-name" -> "userName"）
 * - 处理URL路径参数转换为变量名
 * - 将配置文件中的短横线键名转换为代码中的驼峰键名
 * - 处理Vue/React组件的props命名转换
 * 
 * 原理：
 * 1. 使用 split('-') 将字符串按短横线分割成单词数组
 * 2. 使用 filter(Boolean) 过滤掉空字符串（处理连续短横线或首尾短横线的情况）
 * 3. 使用 map 遍历每个单词：
 *    - 第一个单词（index === 0）：保持原样（小写开头）
 *    - 其他单词：首字母大写（charAt(0).toUpperCase() + slice(1)）
 * 4. 使用 join('') 将所有单词拼接成驼峰命名字符串
 * 
 * 优点：
 * - 自动处理多个连续短横线的情况
 * - 自动处理首尾短横线的情况
 * - 第一个单词保持小写，符合camelCase规范
 * - 支持任意长度的短横线命名转换
 * 
 * 示例：
 * - kebabToCamelCase('my-button') => 'myButton'
 * - kebabToCamelCase('user-name') => 'userName'
 * - kebabToCamelCase('data-user-id') => 'dataUserId'
 * - kebabToCamelCase('--test--case--') => 'testCase'（过滤空字符串）
 * - kebabToCamelCase('hello-world') => 'helloWorld'
 * 
 * 注意事项：
 * - 只处理短横线（-），不处理下划线（_）
 * - 转换后的第一个单词保持原样，不会强制小写
 * - 如果原字符串没有短横线，会原样返回
 * 
 * @param str - 短横线命名的字符串
 * @returns 驼峰命名的字符串
 */
function kebabToCamelCase(str: string): string {
  return str
    .split('-')
    .filter(Boolean)
    .map((word, index) =>
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join('');
}

export {
  capitalizeFirstLetter,
  kebabToCamelCase,
  toCamelCase,
  toLowerCaseFirstLetter,
};
