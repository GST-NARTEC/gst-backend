/**
 * @swagger
 * /api/user/v2/create:
 *   post:
 *     tags:
 *       - User
 *     summary: Register user with cart
 *     description: Creates new user and associates with existing cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - cartId
 *               - companyLicenseNo
 *               - companyNameEn
 *               - companyNameAr
 *               - mobile
 *               - country
 *               - region
 *               - city
 *               - zipCode
 *               - streetAddress
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               cartId:
 *                 type: string
 *                 format: uuid
 *               companyLicenseNo:
 *                 type: string
 *               companyNameEn:
 *                 type: string
 *               companyNameAr:
 *                 type: string
 *               landline:
 *                 type: string
 *               mobile:
 *                 type: string
 *               country:
 *                 type: string
 *               region:
 *                 type: string
 *               city:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               streetAddress:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         email:
 *                           type: string
 *                           format: email
 *                         companyLicenseNo:
 *                           type: string
 *                         companyNameEn:
 *                           type: string
 *                         companyNameAr:
 *                           type: string
 *                         cart:
 *                           $ref: '#/components/schemas/Cart'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
