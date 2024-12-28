/**
 * @swagger
 * components:
 *   schemas:
 *     Localization:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         key:
 *           type: string
 *         valueEn:
 *           type: string
 *         valueAr:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 * /api/v1/localizations:
 *   post:
 *     summary: Create a new localization
 *     tags: [Localizations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [key, valueEn, valueAr]
 *             properties:
 *               key:
 *                 type: string
 *               valueEn:
 *                 type: string
 *               valueAr:
 *                 type: string
 *     responses:
 *       201:
 *         description: Localization created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 201
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Localization created
 *                 data:
 *                   $ref: '#/components/schemas/Localization'
 *       400:
 *         description: Invalid input
 *
 *   get:
 *     summary: Get paginated localizations
 *     tags: [Localizations]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Localization'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *
 * /api/v1/localizations/all:
 *   get:
 *     summary: Get all localizations formatted by language
 *     tags: [Localizations]
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Localizations fetched
 *                 data:
 *                   type: object
 *                   properties:
 *                     en:
 *                       type: object
 *                       additionalProperties:
 *                         type: string
 *                     ar:
 *                       type: object
 *                       additionalProperties:
 *                         type: string
 *
 * /api/v1/localizations/{id}:
 *   put:
 *     summary: Update a localization
 *     tags: [Localizations]
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
 *             type: object
 *             required: [key, valueEn, valueAr]
 *             properties:
 *               key:
 *                 type: string
 *               valueEn:
 *                 type: string
 *               valueAr:
 *                 type: string
 *     responses:
 *       200:
 *         description: Localization updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Localization updated
 *                 data:
 *                   $ref: '#/components/schemas/Localization'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Localization not found
 *
 *   delete:
 *     summary: Delete a localization
 *     tags: [Localizations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Localization deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Localization deleted
 *                 data:
 *                   type: null
 *       404:
 *         description: Localization not found
 */
