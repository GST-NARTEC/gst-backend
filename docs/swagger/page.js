/**
 * @swagger
 * components:
 *   schemas:
 *     PageCreate:
 *       type: object
 *       required:
 *         - nameEn
 *         - nameAr
 *         - slug
 *         - template
 *       properties:
 *         nameEn:
 *           type: string
 *         nameAr:
 *           type: string
 *         slug:
 *           type: string
 *         template:
 *           type: string
 *     PageUpdate:
 *       type: object
 *       minProperties: 1
 *       properties:
 *         nameEn:
 *           type: string
 *         nameAr:
 *           type: string
 *         slug:
 *           type: string
 *         template:
 *           type: string
 *     Page:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         nameEn:
 *           type: string
 *         nameAr:
 *           type: string
 *         slug:
 *           type: string
 *         template:
 *           type: string
 *         subMenus:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SubMenu'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/page/v1:
 *   post:
 *     summary: Create a new page
 *     tags: [Pages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PageCreate'
 *   get:
 *     summary: Get all pages with optional pagination and search
 *     tags: [Pages]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Optional search term for nameEn, nameAr, or slug
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [nameEn, nameAr, createdAt]
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of pages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Pages retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     pages:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Page'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *       400:
 *         description: Invalid query parameters
 *
 * /api/page/v1/template/{template}:
 *   get:
 *     summary: Get pages by template
 *     tags: [Pages]
 *     parameters:
 *       - in: path
 *         name: template
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of pages with specified template
 *
 * /api/page/v1/{id}:
 *   get:
 *     summary: Get a page by ID
 *     tags: [Pages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *   put:
 *     summary: Update a page
 *     description: Update one or more fields of a page. At least one field must be provided.
 *     tags: [Pages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PageUpdate'
 *     responses:
 *       200:
 *         description: Page updated successfully
 *       400:
 *         description: Validation error or no fields provided
 *       404:
 *         description: Page not found
 *   delete:
 *     summary: Delete a page
 *     tags: [Pages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *
 * /api/pages/slug/{slug}:
 *   get:
 *     summary: Get page by slug
 *     tags: [Pages]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: The page slug
 *     responses:
 *       200:
 *         description: Page retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Page retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     page:
 *                       $ref: '#/components/schemas/Page'
 *       404:
 *         description: Page not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Page not found
 *                 data:
 *                   type: object
 *                   example: null
 */
