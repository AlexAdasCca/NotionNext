import Link from 'next/link'
import { siteConfig } from '@/lib/config'

/**
 * 首页导航大按钮组件
 * @param {*} props
 * @returns
 */
const NavButtonGroup = (props) => {
  const { categoryOptions } = props
  const CATEGORY_COUNT = siteConfig('HEXO_HOME_NAV_CATEGORY_COUNT', 9)

  if (!categoryOptions || categoryOptions.length === 0) {
    return <></>
  }

  const showMore = categoryOptions.length > CATEGORY_COUNT
  const previewList = showMore
    ? categoryOptions.slice(0, CATEGORY_COUNT)
    : categoryOptions

  return (
    <nav
      id='home-nav-button'
      className='w-full z-10 md:h-72 md:mt-6 xl:mt-32 px-5 py-2 mt-8 flex flex-wrap md:max-w-6xl space-y-2 md:space-y-0 md:flex justify-center max-h-80 overflow-auto'
    >
      {previewList.map(category => (
        <Link
          key={`${category.name}`}
          title={`${category.name}`}
          href={`/category/${category.name}`}
          className='text-center shadow-text w-full sm:w-4/5 md:mx-6 md:w-40 md:h-14 lg:h-20 h-14 justify-center items-center flex border-2 cursor-pointer rounded-lg glassmorphism hover:bg-white hover:text-black duration-200 hover:scale-105 transform'
        >
          {category.name}
        </Link>
      ))}

      {/* 查看全部分类按钮 */}
      {showMore && (
        <Link
          href='/category'
          className='text-center shadow-text w-full sm:w-4/5 md:mx-6 md:w-40 md:h-14 lg:h-20 h-14 justify-center items-center flex border-2 border-dashed cursor-pointer rounded-lg glassmorphism hover:bg-white hover:text-black duration-200 hover:scale-105 transform'
        >
          全部分类 →
        </Link>
      )}
    </nav>
  )
}

export default NavButtonGroup
