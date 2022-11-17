import { RenderAssetSourceCtx } from 'datocms-plugin-sdk';
import {
  Button,
  Spinner,
  TextInput,
  useCtx,
} from 'datocms-react-ui';
import classNames from 'classnames';
import {
  useEffect,
  useState,
} from 'react';

import s from './styles.module.css';

const AssetBrowser = () => {
  const ctx = useCtx<RenderAssetSourceCtx>();
  const [query, setQuery] = useState('');
  const [imageShopData, setImageShopData] = useState<any>([])
  const [page, setPage] = useState(10);
  const handleImageShopSelect =
    async (photo: any) => {
      const image = await fetch('https://api.imageshop.no/Download', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/json',
          'Accept': 'application/json',
          'token': 'FKwgKJm4qd2DHojmdHC5gP2bg4mS8eqkCbR1sCi6qX0k0dw7YY'
        },
        body: `{
          "DocumentId": ${photo.DocumentID} ,
          "Quality": "OriginalFile",
          "DownloadAsAttachment": false
        }`

      })
      const json = await image.json()
      ctx.select({
        resource: {
          url: `${json.Url}&w=2500&fm=jpg&q=80&fit=max`,
          filename: `${photo.FileName
            }`,
        },
        author: 'photo.user.name',
        notes: photo.Description || undefined,
        // default_field_metadata: ctx.site.attributes.locales.reduce(
        //   (acc, locale) => {
        //     if (locale.startsWith('en')) {
        //       return {
        //         ...acc,
        //         [locale]: {
        //           alt: photo.alt_description,
        //           title: null,
        //           custom_data: {
        //             unsplash_author_username: photo.user.username,
        //             unsplash_photo_id: photo.id,
        //           },
        //         },
        //       };
        //     }

        //     return {
        //       ...acc,
        //       [locale]: { alt: null, title: null, custom_data: {} },
        //     };
        //   },
        //   {},
        // ),
      });
    }


  const fetchData = async () => {
    const response = await fetch('https://api.imageshop.no/Search2', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/json',
        'Accept': 'application/json',
        'token': 'FKwgKJm4qd2DHojmdHC5gP2bg4mS8eqkCbR1sCi6qX0k0dw7YY '
      },
      body: `{"Querystring": "${query}","Pagesize": ${page} }`

    })
    const json = await response.json()
    setImageShopData(json)
  }

  useEffect(() => {
    fetchData().catch(console.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const handleSubmit = (e: any) => {
    e.preventDefault()
    setPage(10)
    console.log({ page });
    fetchData()
  }

  return (
    <div>
      {/* todo: add search button */}
      <form className={s.search} onSubmit={handleSubmit}>
        <div className={s.searchFirstRow}>
          <TextInput
            value={query}
            placeholder="Search imageShop..."
            onChange={(newValue) => setQuery(newValue)}
            className={s.search__input}
          />
          <Button
            type="submit"
            buttonSize="s"
            buttonType="primary"
          >
            Search
          </Button>
        </div>
      </form>
      <div>
        <div className={classNames(s.container, s.grid)}>
          {/* {loading && <Spinner size={50} placement="centered" />} */}
          {imageShopData.DocumentList ? (
            imageShopData.DocumentList.map((image: any) => {
              return (
                <div onClick={handleImageShopSelect.bind(null, image)} key={image.Code + image.DocumentId}>
                  <img src={image.LargeThumbUrl} alt="" />
                </div>

              )
            })
          ) : 'loading...'}
        </div>
        <div className={s.footer}>
          <Button
            type="button"
            onClick={() => setPage(page + 10)}
            disabled={imageShopData?.NumberOfDocuments === imageShopData?.DocumentList?.length}
            fullWidth
          >
            {imageShopData?.NumberOfDocuments === imageShopData?.DocumentList?.length ? 'All images loaded' : 'Load more...'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssetBrowser;
