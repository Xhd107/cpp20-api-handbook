const tex = String.raw;

// 每步先写推导说明，后写可独立排版的 LaTeX 公式。
export const graphicsTheory = {
  'gfx-lerp-remap': [
    ['把输入减去起点，再除以区间长度，得到它在旧区间中的比例。用同一比例走过新区间。',
      tex`u=\frac{x-a}{b-a},\qquad y=(1-u)c+ud,\quad a\ne b.`],
    ['例如，35 在 20 到 80 之间走了四分之一，映射到 0 到 320 就得到 80。',
      tex`u=\frac{35-20}{80-20}=\frac14,\qquad y=\frac14\cdot320=80.`]
  ],
  'gfx-smoothstep': [
    ['先把输入映射并限制到单位区间，然后找一个三次多项式，令两端取值为 0 和 1，且两端斜率为零。',
      tex`t=\operatorname{clamp}\!\left(\frac{x-a}{b-a},0,1\right),\quad a<b.`,
      tex`s(0)=0,\quad s(1)=1,\quad s'(0)=s'(1)=0.`],
    ['零点处的两个条件消去常数项和一次项。剩下两个条件给出二次项系数 3 和三次项系数 −2。',
      tex`s(t)=At^3+Bt^2,\quad A+B=1,\quad 3A+2B=0.`,
      tex`s(t)=3t^2-2t^3,\qquad s'(t)=6t(1-t).`]
  ],
  'gfx-float-tolerance': [
    ['把绝对误差与两个阈值中的较大者比较。绝对容差处理接近零的数，相对容差跟随数值尺度。',
      tex`|a-b|\le \max\!\left(\varepsilon_a,\ \varepsilon_r\max(|a|,|b|)\right).`],
    ['公式用于有限数，绝对容差有限且非负，相对容差取 0 到 1 之间（不含 1）。绝对容差与输入同单位，相对容差无量纲。']
  ],
  'gfx-point-vector-homogeneous': [
    ['把仿射变换写成左上角的线性部分 A 和右列的平移 t。计算最后一列的贡献可看出何时会平移。',
      tex`\begin{bmatrix} A&\mathbf t\\\mathbf 0^{\mathsf T}&1\end{bmatrix}
      \begin{bmatrix}\mathbf x\\w\end{bmatrix}=\begin{bmatrix}A\mathbf x+w\mathbf t\\w\end{bmatrix}.`],
    ['普通位置取 w=1，方向取 w=0。两个位置相减也会得到 w=0。',
      tex`(\mathbf p,1)-(\mathbf q,1)=(\mathbf p-\mathbf q,0).`]
  ],
  'gfx-dot-projection': [
    ['点积等于两向量长度之积乘上夹角余弦。若只求角度，两向量必须非零。',
      tex`\mathbf a\cdot\mathbf b
      =a_x b_x+a_y b_y+a_z b_z=\|\mathbf a\|\|\mathbf b\|\cos\theta.`],
    ['设垂足是向量 k b。要求残差与非零方向 b 垂直，解出 k 就得到向量投影。',
      tex`(\mathbf a-k\mathbf b)\cdot\mathbf b=0
      \quad\Longrightarrow\quad
      \operatorname{proj}_{\mathbf b}\mathbf a
      =\frac{\mathbf a\cdot\mathbf b}{\mathbf b\cdot\mathbf b}\mathbf b.`]
  ],
  'gfx-cross-normal': [
    ['右手坐标系中，叉积垂直于两个输入。长度等于以它们为边的平行四边形面积。',
      tex`\mathbf a\times\mathbf b=
      \begin{bmatrix}a_yb_z-a_zb_y\\a_zb_x-a_xb_z\\a_xb_y-a_yb_x\end{bmatrix},
      \quad \|\mathbf a\times\mathbf b\|=\|\mathbf a\|\|\mathbf b\|\sin\theta.`],
    ['三角形取两条出边做叉积，长度除以二。交换出边顺序会翻转法线。',
      tex`A_{\triangle}=\tfrac12\|(\mathbf B-\mathbf A)\times(\mathbf C-\mathbf A)\|.`]
  ],
  'gfx-safe-normalize': [
    ['用向量的长度除每个分量。判断能否归一化时可先比较平方长度，避免对失败输入开方。',
      tex`\|\mathbf v\|=\sqrt{\mathbf v\cdot\mathbf v},\qquad
      \hat{\mathbf v}=\frac{\mathbf v}{\|\mathbf v\|},\quad
      \mathbf v\cdot\mathbf v>\varepsilon^2.`]
  ],
  'gfx-orthonormal-basis': [
    ['给定单位 z 轴，选和它不共线的辅助向量 h。先做叉积得到垂直于 z 的 x，再补出 y。',
      tex`\mathbf x=\frac{\mathbf h\times\mathbf z}{\|\mathbf h\times\mathbf z\|},
      \qquad \mathbf y=\mathbf z\times\mathbf x.`],
    ['把三个基向量按列排成矩阵。列互相垂直且长度为 1，所以转置就是逆。若是法线贴图，还要用模型的 UV 切线约定。',
      tex`B=[\,\mathbf x\ \mathbf y\ \mathbf z\,],\qquad
      \mathbf v_{\mathrm{world}}=B\mathbf v_{\mathrm{local}},\quad
      \mathbf v_{\mathrm{local}}=B^{\mathsf T}\mathbf v_{\mathrm{world}}.`]
  ],
  'gfx-signed-angle': [
    ['先去掉沿单位转轴 n 的分量。两个投影均非零时，点积给出与余弦成比例的量，有向叉积给出与正弦成比例的量。',
      tex`\mathbf a_\perp=\mathbf a-(\mathbf a\cdot\mathbf n)\mathbf n,\qquad
      \mathbf b_\perp=\mathbf b-(\mathbf b\cdot\mathbf n)\mathbf n.`,
      tex`\theta=\operatorname{atan2}\!\bigl(\mathbf n\cdot(\mathbf a_\perp\times\mathbf b_\perp),\
      \mathbf a_\perp\cdot\mathbf b_\perp\bigr).`],
    ['在 XY 平面选 +Z 为轴时，第一项就是二维行列式，从 +X 转向 +Y 得到正角。',
      tex`\theta=\operatorname{atan2}(a_xb_y-a_yb_x,\ a_xb_x+a_yb_y).`]
  ],
  'gfx-closest-point-segment': [
    ['先求无限直线的垂足。垂足处残差与线段方向垂直，解出参数并限制到两端点之间。',
      tex`\mathbf d=\mathbf B-\mathbf A,\qquad
      t=\operatorname{clamp}\!\left(\frac{(\mathbf P-\mathbf A)\cdot\mathbf d}{\mathbf d\cdot\mathbf d},0,1\right).`,
      tex`\mathbf Q=\mathbf A+t\mathbf d,\qquad d^2=\|\mathbf P-\mathbf Q\|^2.`],
    ['线段退化为一点时，直接取端点 A。只比较远近时用平方距离即可。']
  ],
  'gfx-plane-signed-distance': [
    ['若平面方程为 n·x+c=0，把法向量和常数项同时除以法向量长度，代入点 P 就得到带正负号的距离。',
      tex`d=\frac{\mathbf n\cdot\mathbf P+c}{\|\mathbf n\|},\qquad
      \mathbf Q=\mathbf P-d\,\frac{\mathbf n}{\|\mathbf n\|}.`],
    ['投影点 Q 沿法线移动了恰好这段距离，代回平面方程得到 0。']
  ],
  'gfx-reflect-direction': [
    ['分解指向表面的入射方向。反射保留平行于表面的分量，将沿单位法线的分量取反。',
      tex`\mathbf I_n=(\mathbf I\cdot\mathbf N)\mathbf N,\qquad
      \mathbf I_t=\mathbf I-\mathbf I_n.`,
      tex`\mathbf R=\mathbf I_t-\mathbf I_n=\mathbf I-2(\mathbf I\cdot\mathbf N)\mathbf N.`]
  ],
  'gfx-matrix-composition': [
    ['模型矩阵 M 把局部点送到世界空间，视图矩阵 V 把世界点送到相机空间，投影矩阵 P 输出齐次裁剪坐标。把前一步的结果代入下一步，顺序就确定了。',
      tex`\begin{aligned}
      \mathbf p_{\mathrm{world}}&=M\mathbf p_{\mathrm{local}},\\
      \mathbf p_{\mathrm{view}}&=V\mathbf p_{\mathrm{world}},\\
      \mathbf p_{\mathrm{clip}}&=P\mathbf p_{\mathrm{view}}
      =P\bigl(V(M\mathbf p_{\mathrm{local}})\bigr).
      \end{aligned}`],
    ['矩阵乘法可结合，因此可以预先合成一个矩阵。右边的 M 最先作用。裁剪之后，才用输出的 w 做透视除法。',
      tex`M_{\mathrm{MVP}}=PVM,\quad
      \mathbf p_{\mathrm{clip}}=M_{\mathrm{MVP}}\mathbf p_{\mathrm{local}}.`,
      tex`\mathbf p_{\mathrm{ndc}}=\frac{(x_c,y_c,z_c)}{w_c}.`],
    ['用简单数值查顺序：局部 x=1，模型沿 x 放大两倍再平移 3，相机在 x=1 且与世界轴对齐。结果先到世界 x=5，再到观察空间 x=4。',
      tex`x_{\mathrm{world}}=2\cdot1+3=5,\qquad x_{\mathrm{view}}=5-1=4.`]
  ],
  'gfx-trs-transform': [
    ['分别用齐次矩阵表示缩放、旋转和平移。以绕 +Z 旋转为例，XY 平面的两列由旋转后的基向量组成。',
      tex`S=\operatorname{diag}(s_x,s_y,s_z,1),\qquad
      T=\begin{bmatrix}I_3&\mathbf t\\\mathbf 0^{\mathsf T}&1\end{bmatrix}.`,
      tex`R_z(\theta)=\begin{bmatrix}\cos\theta&-\sin\theta&0&0\\
      \sin\theta&\cos\theta&0&0\\0&0&1&0\\0&0&0&1\end{bmatrix}.`],
    ['先缩放、再绕原点旋转、最后平移，合成时按列向量约定从右向左作用。绕中心 c 旋转时，先把 c 移到原点，再移回去。',
      tex`M=TRS,\qquad M_{\mathrm{pivot}}=T(\mathbf c)R\,T(-\mathbf c).`]
  ],
  'gfx-rodrigues-rotation': [
    ['设旋转轴 k 已归一化并经过原点，采用右手正方向。先把向量 v 投影到轴上，其余部分落在垂直于轴的平面。',
      tex`\mathbf v_\parallel=(\mathbf k\cdot\mathbf v)\mathbf k,\quad
      \mathbf v_\perp=\mathbf v-\mathbf v_\parallel,\quad \|\mathbf k\|=1.`],
    ['轴向分量保持不动。垂直平面中的第二个方向由 k 与垂直分量做叉积得到，它与垂直分量等长且相差正 90°。因此平面旋转可以按余弦和正弦组合。',
      tex`\mathbf v'=\mathbf v_\parallel+
      \cos\theta\,\mathbf v_\perp+
      \sin\theta\,(\mathbf k\times\mathbf v_\perp).`],
    ['把垂直分量展开。轴向分量与 k 平行，叉积为零，因此最后只需一次点积和一次叉积。',
      tex`\begin{aligned}
      \mathbf v'={}&\cos\theta\,\mathbf v+\sin\theta\,(\mathbf k\times\mathbf v)\\
      &+(1-\cos\theta)(\mathbf k\cdot\mathbf v)\mathbf k.
      \end{aligned}`],
    ['若需要 3×3 矩阵，用方括号表示叉积算子即可。以 +Z 为轴旋转 90° 时，+X 应变成 +Y。',
      tex`[\mathbf k]_\times\mathbf v=\mathbf k\times\mathbf v,\qquad
      R=\cos\theta\,I+\sin\theta\,[\mathbf k]_\times+
      (1-\cos\theta)\mathbf k\mathbf k^{\mathsf T}.`]
  ],
  'gfx-normal-matrix': [
    ['原本的法线 n 与任意切线 t 垂直。坐标的线性变换 L 让切线变成 Lt，要求新的法线仍与它垂直。',
      tex`0={\mathbf n'}^{\mathsf T}L\mathbf t
      =\bigl(L^{\mathsf T}\mathbf n'\bigr)^{\mathsf T}\mathbf t.`],
    ['选取让括号等于原法线的解。假设 L 可逆，求出逆转置，再把结果归一化。',
      tex`L^{\mathsf T}\mathbf n'=\mathbf n
      \quad\Longrightarrow\quad
      \mathbf n'=(L^{-1})^{\mathsf T}\mathbf n,\qquad
      \hat{\mathbf n}'=\frac{\mathbf n'}{\|\mathbf n'\|}.`]
  ],
  'gfx-lookat-view': [
    ['采用右手坐标系，相机朝局部 −Z。由相机位置 e、目标 c 和参考上方向构建前、右、上三个单位向量。',
      tex`\mathbf f=\operatorname{normalize}(\mathbf c-\mathbf e),\quad
      \mathbf r=\operatorname{normalize}(\mathbf f\times\mathbf u_0),\quad
      \mathbf u=\mathbf r\times\mathbf f.`],
    ['从世界点减去相机位置，再分别投影到右、上、后这三条轴。把三个点积展开，就是 V 的前三行。',
      tex`V=\begin{bmatrix}
      \mathbf r^{\mathsf T}&-\mathbf r\cdot\mathbf e\\
      \mathbf u^{\mathsf T}&-\mathbf u\cdot\mathbf e\\
      -\mathbf f^{\mathsf T}&\mathbf f\cdot\mathbf e\\
      \mathbf 0^{\mathsf T}&1
      \end{bmatrix}.`],
    ['检查相机位置应映射到原点，相机正前方距离 d 的点应映射到观察坐标 (0,0,−d)。']
  ],
  'gfx-quaternion-slerp': [
    ['用标量在前的记法。以单位轴 k 和角度 θ 构造单位四元数，通过乘以 q 和 q 的共轭来旋转向量。',
      tex`q=(\cos(\theta/2),\,\mathbf k\sin(\theta/2)),\qquad
      (0,\mathbf v')=q(0,\mathbf v)q^{-1},\quad q^{-1}=q^*.`],
    ['单位四元数可看成四维单位球上的点。先令两端点的点积非负以选短弧，再按相对角度 Ω 取圆弧上的点。',
      tex`\Omega=\arccos(q_0\cdot q_1),\qquad
      q(t)=\frac{\sin((1-t)\Omega)q_0+\sin(t\Omega)q_1}{\sin\Omega}.`]
  ],
  'gfx-affine-inverse': [
    ['由世界点等于线性变换加平移，先在两边减去平移，再左乘逆矩阵。',
      tex`\mathbf p_w=A\mathbf p_l+\mathbf t
      \quad\Longrightarrow\quad
      \mathbf p_l=A^{-1}(\mathbf p_w-\mathbf t).`],
    ['方向没有平移。对射线代入整个点变换，可以看出保留变换后的方向长度就能沿用原参数。仅当 A 正交时，逆等于转置。',
      tex`A^{-1}(\mathbf O+s\mathbf D-\mathbf t)=
      A^{-1}(\mathbf O-\mathbf t)+sA^{-1}\mathbf D.`]
  ],
  'gfx-transform-hierarchy': [
    ['子节点局部矩阵把点送到父节点空间，再由父节点的世界矩阵送到世界空间。',
      tex`W_{\mathrm{child}}=W_{\mathrm{parent}}L_{\mathrm{child}}.`],
    ['换父节点时固定等号左边，再左乘新父节点世界矩阵的逆。父节点世界矩阵必须可逆。',
      tex`L_{\mathrm{new}}=(W_{\mathrm{new\ parent}})^{-1}W_{\mathrm{child}}.`]
  ],
  'gfx-basis-handedness': [
    ['设 C 把旧坐标改写成新坐标。要在新坐标中执行原有变换，先转回旧坐标，应用 A，再转到新坐标。',
      tex`\mathbf p'=C\mathbf p,\quad \mathbf q'=C\mathbf q=CA\mathbf p
      =CAC^{-1}\mathbf p',\quad A'=CAC^{-1}.`],
    ['行列式是有向体积的倍率。轴交换或镜像后若行列式为负，空间取向翻转。',
      tex`C=\operatorname{diag}(1,1,-1)\quad\Longrightarrow\quad\det C=-1.`]
  ],
  'gfx-orthographic-projection': [
    ['正交投影沿每个轴做一次区间映射。以 x 轴为例，先得到单位比例，再映射到 −1 到 1。',
      tex`x_{\mathrm{ndc}}=\frac{2(x-l)}{r-l}-1=\frac{2x-(r+l)}{r-l}.`],
    ['假设右手相机朝 −Z，近远距离 n、f 为正，目标深度范围为 0 到 1，可用以下矩阵。最后一行使 w 保持为 1。',
      tex`P_{\mathrm{ortho}}=\begin{bmatrix}
      \frac{2}{r-l}&0&0&-\frac{r+l}{r-l}\\
      0&\frac{2}{t-b}&0&-\frac{t+b}{t-b}\\
      0&0&-\frac{1}{f-n}&-\frac{n}{f-n}\\
      0&0&0&1
      \end{bmatrix}.`]
  ],
  'gfx-perspective-matrix': [
    ['设右手相机朝 −Z，近远距离为 0<n<f，垂直视场角为 φ，宽高比为 a。相似三角形给出距离 s 处的半高。在边界上要求 NDC 坐标达到 ±1。',
      tex`s=-z,\quad y_{\max}=s\tan(\phi/2),\quad
      x_{\max}=a\,s\tan(\phi/2).`],
    ['令齐次分量 w 等于 s，以便透视除法产生 1/s。于是横纵分量只需乘各自的比例。',
      tex`g=\cot(\phi/2),\qquad (x_c,y_c,w_c)=(gx/a,gy,-z).`],
    ['深度写成 z_c=Az+B。若 NDC 深度要求近平面为 −1、远平面为 1，那么两条边界条件就能求出 A 和 B。',
      tex`\frac{-An+B}{n}=-1,\qquad
      \frac{-Af+B}{f}=1.`,
      tex`P=\begin{bmatrix}
      g/a&0&0&0\\0&g&0&0\\
      0&0&\frac{f+n}{n-f}&\frac{2fn}{n-f}\\
      0&0&-1&0
      \end{bmatrix}.`],
    ['若目标深度改为 0 到 1，将近平面约束改为 0 后重解。只需替换深度行的后两项。',
      tex`A=\frac{f}{n-f},\qquad B=\frac{fn}{n-f}.`]
  ],
  'gfx-perspective-divide': [
    ['在默认齐次裁剪空间中，左右及上下边界由 ±w 定义。以深度为 0 到 1 的约定为例，近远边界为 0 和 w。',
      tex`-w_c\le x_c,y_c\le w_c,\qquad 0\le z_c\le w_c.`],
    ['深度为 −1 到 1 的约定则使用 −w 作为下界。图元先裁剪，保留部分再除以 w。',
      tex`\mathbf p_{\mathrm{ndc}}=\left(\frac{x_c}{w_c},\,\frac{y_c}{w_c},\,\frac{z_c}{w_c}\right).`]
  ],
  'gfx-viewport-pixel-center': [
    ['令 NDC 的 Y 向上，屏幕 Y 向下，视口左上角为 (x₀,y₀)，宽高为 W、H。',
      tex`x_s=x_0+W\frac{x_{\mathrm{ndc}}+1}{2},\qquad
      y_s=y_0+H\frac{1-y_{\mathrm{ndc}}}{2}.`],
    ['整数索引 (i,j) 表示从视口左上数起的像素。采样中心相对边界各偏移半个像素。',
      tex`\mathbf p_{\mathrm{center}}=(x_0+i+\tfrac12,\ y_0+j+\tfrac12).`]
  ],
  'gfx-barycentric': [
    ['对非退化三角形，令 B−A 与 C−A 为三角形平面的两条基。对平面内的点写出线性组合。',
      tex`\mathbf P-\mathbf A=\beta(\mathbf B-\mathbf A)+\gamma(\mathbf C-\mathbf A),\quad
      \alpha=1-\beta-\gamma.`],
    ['两侧依次与两条基做点积，得到二元线性方程。系数矩阵的行列式为零时，三角形退化。三项权重都非负时，点在三角形内或边界上。',
      tex`\begin{bmatrix}\mathbf e_0\cdot\mathbf e_0&\mathbf e_0\cdot\mathbf e_1\\
      \mathbf e_0\cdot\mathbf e_1&\mathbf e_1\cdot\mathbf e_1\end{bmatrix}
      \begin{bmatrix}\beta\\\gamma\end{bmatrix}=
      \begin{bmatrix}(\mathbf P-\mathbf A)\cdot\mathbf e_0\\(\mathbf P-\mathbf A)\cdot\mathbf e_1\end{bmatrix}.`],
    ['用同一空间中的权重插值仿射属性，例如在三角形平面上插值顶点颜色。',
      tex`a(\mathbf P)=\alpha a_A+\beta a_B+\gamma a_C.`]
  ],
  'gfx-perspective-correct': [
    ['设原三角形中的权重为 μ，三个顶点的裁剪分量为 wᵢ。齐次坐标先用 μ 组合，再整体除以组合后的 w。改写成三个已除 w 的顶点之和，就能读出屏幕权重 λ。',
      tex`w=\sum_i\mu_i w_i,\qquad
      \frac{\sum_i\mu_i\mathbf p_{c,i}}{w}
      =\sum_i\underbrace{\frac{\mu_i w_i}{w}}_{\lambda_i}\frac{\mathbf p_{c,i}}{w_i}.`],
    ['先把屏幕权重分别除以各自的 w，再重新归一化为原三角形的权重，最后插值属性。这里使用裁剪后可见三角形的非零 w。',
      tex`\mu_i=\frac{\lambda_i/w_i}{\sum_j\lambda_j/w_j},\qquad
      a=\frac{\sum_i\lambda_i\,a_i/w_i}{\sum_i\lambda_i/w_i}.`]
  ],
  'gfx-bilinear-interpolation': [
    ['先在两条横边上分别按 u 插值，再沿竖直方向按 v 混合。u、v 为当前网格单元内的比例。',
      tex`\begin{aligned}
      f(u,v)={}&(1-v)\big[(1-u)f_{00}+uf_{10}\big]\\
      &+v\big[(1-u)f_{01}+uf_{11}\big].
      \end{aligned}`],
    ['单元中心 u=v=1/2 时，四个角的权重各为四分之一。']
  ],
  'gfx-unproject-screen': [
    ['按实际视口反算 NDC。NDC 可用 w=1 写成同一个齐次点的代表，然后左乘投影与视图复合矩阵的逆。',
      tex`\mathbf h=(PV)^{-1}(x_{\mathrm{ndc}},y_{\mathrm{ndc}},z_{\mathrm{ndc}},1)^{\mathsf T},
      \qquad \mathbf p_w=\frac{\mathbf h_{xyz}}{h_w}.`],
    ['只有鼠标位置时，反投影同一像素的两个有限深度点。近端点作为射线原点，两点之差决定方向。',
      tex`\mathbf R(t)=\mathbf p_{\mathrm{near}}+
      t\,\operatorname{normalize}(\mathbf p_{\mathrm{far}}-\mathbf p_{\mathrm{near}}),\quad t\ge0.`]
  ],
  'gfx-depth-linearization': [
    ['标准透视下 w 等于轴向距离 s，裁剪 z 是 s 的仿射函数。因此深度 d 可以写成距离倒数的线性函数。',
      tex`d=\frac{As+B}{s}=A+\frac{B}{s}.`],
    ['设有限近平面 n 映射到 0、远平面 f 映射到 1，求出 A、B，再解 s。分母的等价写法可避免在深度接近 1 时用两个大数相减。',
      tex`A=\frac{f}{f-n},\quad B=-\frac{fn}{f-n},\qquad
      s=\frac{nf}{n+(1-d)(f-n)}.`],
    ['如果反向 Z 把近端映射到 1、远端映射到 0，在前一式中用 1−d 替代 d。',
      tex`s_{\mathrm{reversed}}=\frac{nf}{n+d(f-n)}.`]
  ],
  'gfx-frustum-planes': [
    ['用 rᵢ 表示 PV 的第 i 个数学行。裁剪空间左边界要求 x_c+w_c≥0，代入矩阵各行就变成世界空间的平面不等式。',
      tex`x_c+w_c=(r_0+r_3)\mathbf p_w\ge0.`],
    ['用同样的方法取出其余平面。深度约定决定第一条深度边界的形式。',
      tex`\begin{aligned}
      \mathrm{left/right}&:\ r_3\pm r_0,&
      \mathrm{bottom/top}&:\ r_3\pm r_1,\\
      z\in[0,1]&:\ r_2,\ r_3-r_2,&
      z\in[-1,1]&:\ r_3+r_2,\ r_3-r_2.
      \end{aligned}`],
    ['平面内侧满足 n·p+d≥0。球在法线方向上最多比球心前进一个半径，若球上最大的平面值仍小于零，整个球可剔除。',
      tex`\mathbf n\cdot\mathbf c+d+R\|\mathbf n\|<0.`]
  ],
  'gfx-ray-generation': [
    ['令相机基向量分别指向前、右、上。根据像素中心的 NDC 坐标，把它投到距离 1 的参考平面，再从相机朝这个点发射射线。',
      tex`h=\tan(\phi_y/2),\quad
      \mathbf D=\operatorname{normalize}(\mathbf f+a h x_{\mathrm{ndc}}\mathbf r+
      h y_{\mathrm{ndc}}\mathbf u).`,
      tex`\mathbf R(t)=\mathbf O+t\mathbf D,\qquad t\ge0.`],
    ['正交相机中各像素共享方向，改由像素决定射线起点。方向为单位向量时，t 就是距离。']
  ],
  'gfx-ray-plane': [
    ['把射线起点 O 和方向 D 代入平面点法式，收集含 t 的项再除以分母。',
      tex`(\mathbf O+t\mathbf D-\mathbf P_0)\cdot\mathbf N=0
      \quad\Longrightarrow\quad
      t=\frac{(\mathbf P_0-\mathbf O)\cdot\mathbf N}{\mathbf D\cdot\mathbf N}.`],
    ['分母接近零时，射线与平面平行或共面。否则还要检查 t 是否在允许的区间。']
  ],
  'gfx-ray-sphere': [
    ['把射线代入球面方程。令 Q 为起点相对球心的位移，展开平方得到关于 t 的二次式。',
      tex`\|\mathbf Q+t\mathbf D\|^2=R^2,\qquad \mathbf Q=\mathbf O-\mathbf C.`,
      tex`a=\mathbf D\cdot\mathbf D,\quad b=2\mathbf Q\cdot\mathbf D,\quad
      c=\mathbf Q\cdot\mathbf Q-R^2.`],
    ['判别式为负时无实根。其余情况解二次方程，并取允许区间内最小的根。',
      tex`\Delta=b^2-4ac,\qquad t=\frac{-b\pm\sqrt{\Delta}}{2a}.`]
  ],
  'gfx-moller-trumbore': [
    ['用重心权重 u、v 表示三角形上的位置，与射线的参数表达式联立。它是关于 t、u、v 的三个线性方程。',
      tex`-\mathbf D\,t+\mathbf E_1u+\mathbf E_2v=\mathbf O-\mathbf V_0,\quad
      \mathbf E_1=\mathbf V_1-\mathbf V_0,\quad \mathbf E_2=\mathbf V_2-\mathbf V_0.`],
    ['用标量三重积计算行列式。行列式不接近零时才继续求解；三个重心权重都必须非负。',
      tex`\det=\mathbf E_1\cdot(\mathbf D\times\mathbf E_2),\qquad
      u\ge0,\ v\ge0,\ 1-u-v\ge0.`]
  ],
  'gfx-ray-aabb': [
    ['对每个方向分量非零的轴，计算射线遇到该轴两侧边界的参数，然后把较小值作为进入，较大值作为离开。',
      tex`t_1=\frac{b_{\min,i}-O_i}{D_i},\quad
      t_2=\frac{b_{\max,i}-O_i}{D_i},\quad
      I_i=[\,\min(t_1,t_2),\max(t_1,t_2)\,].`],
    ['取三轴区间与允许的射线区间的交集。平行轴上，起点在该轴范围内便没有额外限制，起点在范围外则直接排除。',
      tex`I_{\mathrm{hit}}=[t_{\min},t_{\max}]\cap I_x\cap I_y\cap I_z.`]
  ],
  'gfx-lambert-diffuse': [
    ['照到倾斜表面上的有效面积带来余弦因子。对点光源，再乘上距离平方的倒数。',
      tex`E=\frac{I}{r^2}\max(0,\mathbf N\cdot\mathbf L).`],
    ['Lambert BRDF 为常数。半球上的余弦积分等于 π，所以用反照率除以 π 来得到所需的能量比例。',
      tex`\int_{\Omega^+}\cos\theta\,d\omega=\pi,\qquad
      f_r=\frac{\rho}{\pi},\qquad L_o=f_rE.`]
  ],
  'gfx-blinn-phong': [
    ['把指向光源和相机的两个单位向量相加并归一化，得到半向量。当半向量接近表面法线时，高光更强。',
      tex`\mathbf H=\frac{\mathbf L+\mathbf V}{\|\mathbf L+\mathbf V\|},\qquad
      S=k_s[\max(0,\mathbf N\cdot\mathbf H)]^p.`],
    ['加大指数 p 会缩窄高光瓣。光源在表面背侧时，常规单面直射光应跳过高光计算。']
  ],
  'gfx-linear-srgb': [
    ['对每个 0 到 1 范围内的 RGB 通道分别使用分段传递函数。靠近黑色的区间用线性段。',
      tex`D(s)=\begin{cases}
      s/12.92 & s\le 0.04045\\
      ((s+0.055)/1.055)^{2.4} & s>0.04045
      \end{cases}`],
    ['D 把 sRGB 解码为线性值。反向使用 E，把线性值编码为 sRGB。',
      tex`E(l)=\begin{cases}
      12.92l & l\le 0.0031308\\
      1.055l^{1/2.4}-0.055 & l>0.0031308
      \end{cases}`]
  ],
  'gfx-bezier-casteljau': [
    ['对相邻控制点按同一参数插值，得到少一个点的新一层。一直重复，剩下的点就位于曲线上。',
      tex`P_i^{(0)}=P_i,\quad
      P_i^{(k+1)}=(1-u)P_i^{(k)}+uP_{i+1}^{(k)},\quad
      C(u)=P_0^{(n)}.`],
    ['把三次情形的三层展开，可以直接读出四个控制点的 Bernstein 权重。',
      tex`\begin{aligned}
      C(u)={}&(1-u)^3P_0+3(1-u)^2uP_1\\
      &+3(1-u)u^2P_2+u^3P_3,\quad 0\le u\le1.
      \end{aligned}`]
  ],
  'gfx-tangent-normal-map': [
    ['在同一空间中先把法线归一化，再去掉切线沿法线的分量。用叉积和切线手性 s 补出副切线。',
      tex`\mathbf T'=\operatorname{normalize}(\mathbf T-(\mathbf T\cdot\mathbf N)\mathbf N),
      \qquad \mathbf B=s(\mathbf N\times\mathbf T'),\quad s\in\{-1,1\}.`],
    ['线性采样值 c 由 0 到 1 解码到 −1 到 1，然后用 TBN 的三列把局部方向送到世界空间。',
      tex`\mathbf n_{\mathrm{ts}}=2\mathbf c-\mathbf 1,\qquad
      \mathbf n_w=\operatorname{normalize}([\,\mathbf T'\ \mathbf B\ \mathbf N\,]\mathbf n_{\mathrm{ts}}).`]
  ],
  'gfx-monte-carlo': [
    ['当概率密度 p 覆盖被积函数的非零区域时，对随机样本 X 的 f(X)/p(X) 取期望，积分中的 p 会约掉。',
      tex`\mathbb E\!\left[\frac{f(X)}{p(X)}\right]
      =\int_D\frac{f(x)}{p(x)}\,p(x)\,dx=\int_D f(x)\,dx.`],
    ['实际用样本均值估计期望。独立同分布且方差有限时，标准误差随样本数的平方根下降。',
      tex`\widehat I=\frac1N\sum_{i=1}^N\frac{f(X_i)}{p(X_i)},\qquad
      \operatorname{SE}(\widehat I)=\frac{\sigma}{\sqrt N}.`]
  ],
  'gfx-uniform-disk': [
    ['均匀取样时，半径不超过 r 的概率等于小圆与整个圆盘的面积之比。令这个概率等于均匀随机数，再反解半径。',
      tex`F(r)=\frac{\pi r^2}{\pi R^2}=\frac{r^2}{R^2}
      \quad\Longrightarrow\quad r=R\sqrt{\xi_1}.`],
    ['角度使用另一个独立均匀随机数，最后转换成笛卡尔坐标。',
      tex`\phi=2\pi\xi_2,\qquad (x,y)=(r\cos\phi,r\sin\phi).`]
  ],
  'gfx-cosine-hemisphere': [
    ['先在单位圆盘上均匀取点，再沿 +Z 抬到单位半球。',
      tex`r=\sqrt{\xi_1},\quad\phi=2\pi\xi_2,\quad
      \boldsymbol\omega=(r\cos\phi,r\sin\phi,\sqrt{1-\xi_1}).`],
    ['单位球上的面积等于对应的立体角。把球面小片投影到圆盘时，面积乘上 cosθ，故圆盘的均匀面积密度带来半球上的余弦权重。',
      tex`dA_{\mathrm{disk}}=\cos\theta\,d\omega,\qquad
      p_\omega=\frac{\cos\theta}{\pi}=\frac{\omega_z}{\pi}.`]
  ],
  'gfx-stratified-jitter': [
    ['把单位区间切为 N 个等宽层。编号 i 决定所在区间，均匀随机数决定在该层内的位置。',
      tex`x_i=\frac{i+\xi_i}{N},\quad 0\le i<N,\quad \xi_i\in[0,1).`],
    ['二维像素内分别划分 m、n 层。先得到子像素偏移，再加像素原点。',
      tex`\mathbf p_{ij}=\mathbf p_0+
      \left(\frac{i+\xi_x}{m},\frac{j+\xi_y}{n}\right).`]
  ],
  'gfx-solid-angle-pdf': [
    ['从着色点 X 看向光源点 Y。面积小片的投影面积乘上余弦因子，再除以距离平方得到它张开的立体角。',
      tex`r=\|\mathbf Y-\mathbf X\|,\quad \boldsymbol\omega=(\mathbf Y-\mathbf X)/r,\qquad
      d\omega=\frac{|\mathbf N_Y\cdot(-\boldsymbol\omega)|}{r^2}\,dA.`],
    ['同一小片对应的概率为 p_A·dA，也等于 p_ω·dω。两者相等，便得到密度换算式。',
      tex`p_\omega=p_A\frac{r^2}{|\mathbf N_Y\cdot(-\boldsymbol\omega)|}.`]
  ]
};
