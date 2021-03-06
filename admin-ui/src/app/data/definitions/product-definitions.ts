import gql from 'graphql-tag';

export const ASSET_FRAGMENT = gql`
    fragment Asset on Asset {
        id
        name
        fileSize
        mimeType
        type
        preview
        source
    }
`;

export const PRODUCT_VARIANT_FRAGMENT = gql`
    fragment ProductVariant on ProductVariant {
        id
        languageCode
        name
        price
        priceIncludesTax
        priceWithTax
        taxRateApplied {
            id
            name
            value
        }
        taxCategory {
            id
            name
        }
        sku
        options {
            id
            code
            languageCode
            name
        }
        facetValues {
            id
            code
            name
            facet {
                id
                name
            }
        }
        featuredAsset {
            ...Asset
        }
        assets {
            ...Asset
        }
        translations {
            id
            languageCode
            name
        }
    }
    ${ASSET_FRAGMENT}
`;

export const PRODUCT_WITH_VARIANTS_FRAGMENT = gql`
    fragment ProductWithVariants on Product {
        id
        languageCode
        name
        slug
        description
        featuredAsset {
            ...Asset
        }
        assets {
            ...Asset
        }
        translations {
            languageCode
            name
            slug
            description
        }
        optionGroups {
            id
            languageCode
            code
            name
        }
        variants {
            ...ProductVariant
        }
        facetValues {
            id
            code
            name
            facet {
                id
                name
            }
        }
    }
    ${PRODUCT_VARIANT_FRAGMENT}
    ${ASSET_FRAGMENT}
`;

export const PRODUCT_OPTION_GROUP_FRAGMENT = gql`
    fragment ProductOptionGroup on ProductOptionGroup {
        id
        languageCode
        code
        name
        translations {
            name
        }
        options {
            id
            languageCode
            name
            code
            translations {
                name
            }
        }
    }
`;

export const UPDATE_PRODUCT = gql`
    mutation UpdateProduct($input: UpdateProductInput!) {
        updateProduct(input: $input) {
            ...ProductWithVariants
        }
    }
    ${PRODUCT_WITH_VARIANTS_FRAGMENT}
`;

export const CREATE_PRODUCT = gql`
    mutation CreateProduct($input: CreateProductInput!) {
        createProduct(input: $input) {
            ...ProductWithVariants
        }
    }
    ${PRODUCT_WITH_VARIANTS_FRAGMENT}
`;

export const GENERATE_PRODUCT_VARIANTS = gql`
    mutation GenerateProductVariants(
        $productId: ID!
        $defaultTaxCategoryId: ID
        $defaultPrice: Int
        $defaultSku: String
    ) {
        generateVariantsForProduct(
            productId: $productId
            defaultTaxCategoryId: $defaultTaxCategoryId
            defaultPrice: $defaultPrice
            defaultSku: $defaultSku
        ) {
            ...ProductWithVariants
        }
    }
    ${PRODUCT_WITH_VARIANTS_FRAGMENT}
`;

export const UPDATE_PRODUCT_VARIANTS = gql`
    mutation UpdateProductVariants($input: [UpdateProductVariantInput!]!) {
        updateProductVariants(input: $input) {
            ...ProductVariant
        }
    }
    ${PRODUCT_VARIANT_FRAGMENT}
`;

export const CREATE_PRODUCT_OPTION_GROUP = gql`
    mutation CreateProductOptionGroup($input: CreateProductOptionGroupInput!) {
        createProductOptionGroup(input: $input) {
            ...ProductOptionGroup
        }
    }
    ${PRODUCT_OPTION_GROUP_FRAGMENT}
`;

export const ADD_OPTION_GROUP_TO_PRODUCT = gql`
    mutation AddOptionGroupToProduct($productId: ID!, $optionGroupId: ID!) {
        addOptionGroupToProduct(productId: $productId, optionGroupId: $optionGroupId) {
            id
            optionGroups {
                id
                code
                options {
                    id
                    code
                }
            }
        }
    }
`;

export const REMOVE_OPTION_GROUP_FROM_PRODUCT = gql`
    mutation RemoveOptionGroupFromProduct($productId: ID!, $optionGroupId: ID!) {
        removeOptionGroupFromProduct(productId: $productId, optionGroupId: $optionGroupId) {
            id
            optionGroups {
                id
                code
                options {
                    id
                    code
                }
            }
        }
    }
`;

export const GET_PRODUCT_WITH_VARIANTS = gql`
    query GetProductWithVariants($id: ID!, $languageCode: LanguageCode) {
        product(languageCode: $languageCode, id: $id) {
            ...ProductWithVariants
        }
    }
    ${PRODUCT_WITH_VARIANTS_FRAGMENT}
`;

export const GET_PRODUCT_LIST = gql`
    query GetProductList($options: ProductListOptions, $languageCode: LanguageCode) {
        products(languageCode: $languageCode, options: $options) {
            items {
                id
                languageCode
                name
                slug
                featuredAsset {
                    id
                    preview
                }
            }
            totalItems
        }
    }
`;

export const GET_PRODUCT_OPTION_GROUPS = gql`
    query GetProductOptionGroups($filterTerm: String, $languageCode: LanguageCode) {
        productOptionGroups(filterTerm: $filterTerm, languageCode: $languageCode) {
            id
            languageCode
            code
            name
            options {
                id
                languageCode
                code
                name
            }
        }
    }
`;

export const GET_ASSET_LIST = gql`
    query GetAssetList($options: AssetListOptions) {
        assets(options: $options) {
            items {
                ...Asset
            }
            totalItems
        }
    }
    ${ASSET_FRAGMENT}
`;

export const CREATE_ASSETS = gql`
    mutation CreateAssets($input: [CreateAssetInput!]!) {
        createAssets(input: $input) {
            ...Asset
        }
    }
    ${ASSET_FRAGMENT}
`;

export const PRODUCT_CATEGORY_FRAGMENT = gql`
    fragment ProductCategory on ProductCategory {
        id
        name
        description
        languageCode
        featuredAsset {
            ...Asset
        }
        assets {
            ...Asset
        }
        facetValues {
            id
            name
            code
        }
        translations {
            id
            languageCode
            name
            description
        }
        parent {
            id
            name
        }
        children {
            id
            name
        }
    }
    ${ASSET_FRAGMENT}
`;

export const GET_PRODUCT_CATEGORY_LIST = gql`
    query GetProductCategoryList($options: ProductCategoryListOptions, $languageCode: LanguageCode) {
        productCategories(languageCode: $languageCode, options: $options) {
            items {
                id
                name
                description
                featuredAsset {
                    ...Asset
                }
                facetValues {
                    id
                    code
                    name
                    facet {
                        id
                        name
                    }
                }
                parent {
                    id
                }
            }
            totalItems
        }
    }
    ${ASSET_FRAGMENT}
`;

export const GET_PRODUCT_CATEGORY = gql`
    query GetProductCategory($id: ID!, $languageCode: LanguageCode) {
        productCategory(id: $id, languageCode: $languageCode) {
            ...ProductCategory
        }
    }
    ${PRODUCT_CATEGORY_FRAGMENT}
`;

export const CREATE_PRODUCT_CATEGORY = gql`
    mutation CreateProductCategory($input: CreateProductCategoryInput!) {
        createProductCategory(input: $input) {
            ...ProductCategory
        }
    }
    ${PRODUCT_CATEGORY_FRAGMENT}
`;

export const UPDATE_PRODUCT_CATEGORY = gql`
    mutation UpdateProductCategory($input: UpdateProductCategoryInput!) {
        updateProductCategory(input: $input) {
            ...ProductCategory
        }
    }
    ${PRODUCT_CATEGORY_FRAGMENT}
`;

export const MOVE_PRODUCT_CATEGORY = gql`
    mutation MoveProductCategory($input: MoveProductCategoryInput!) {
        moveProductCategory(input: $input) {
            ...ProductCategory
        }
    }
    ${PRODUCT_CATEGORY_FRAGMENT}
`;
