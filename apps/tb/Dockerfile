
FROM node:22

ENV NODE_ENV=production

RUN corepack enable

WORKDIR /app
COPY . .

ARG OPENAI_API_KEY
ENV OPENAI_API_KEY=sk-proj-1TxTfp2WwDvYQxTOcuUJO_VvGCsxp3iC2U3l0qJP9NI2RNFdKhF7LDd9LOLK36ERVTgMD0gFNuT3BlbkFJrTZ1cf_Goh4mVxcWyac6tzy_OV6G42npz3OfNhKdAvnXPW_rqwrwtwyuwuwwu

RUN pnpm install --frozen-lockfile --prod=false
RUN pnpm turbo run build --filter=tb

EXPOSE 3000
CMD ["pnpm", "turbo", "run", "start", "--filter=tb"]

