import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  html,
  body {
    height: 100%;
    width: 100%;
  }

  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }

  #root {
    min-height: 100%;
    min-width: 100%;
  }

  p,
  label {
    font-family: Georgia, Times, 'Times New Roman', serif;
    line-height: 1.5em;
  }

  input, select {
    font-family: inherit;
    font-size: inherit;
  }
  
  /** auth button */
  .btn-auth,
  .btn-auth:visited {
    position: relative;
    display: inline-block;
    height: 22px;
    padding: 0 1em;
    border: 1px solid #999;
    border-radius: 2px;
    margin: 0;
    text-align: center;
    text-decoration: none;
    font-size: 14px;
    line-height: 22px;
    white-space: nowrap;
    cursor: pointer;
    color: #222;
    background: #fff;
    box-sizing: content-box;
    -webkit-appearance: none; /* 1 */
    user-select: none;
  }
  .btn-auth:hover,
  .btn-auth:focus,
  .btn-auth:active {
    color: #222;
    text-decoration: none;
  }
  .btn-auth:before {
    content: '';
    float: left;
    width: 22px;
    height: 22px;
    background: url(auth-icons.png) no-repeat 99px 99px;
  }
  .btn-auth.large {
    height: 36px;
    line-height: 36px;
    font-size: 20px;
  }

  .btn-auth.large:before {
    width: 36px;
    height: 36px;
  }
  .btn-auth::-moz-focus-inner {
    border: 0;
    padding: 0;
  }

  /* GitHub
   ========================================================================== */

  .btn-github,
  .btn-github:visited {
    border-color: #d4d4d4;
    background: #ececec;
    background-image: -webkit-gradient(
      linear,
      0 0,
      0 100%,
      from(#f4f4f4),
      to(#ececec)
    );
    background-image: -webkit-linear-gradient(#f4f4f4, #ececec);
    background-image: -moz-linear-gradient(#f4f4f4, #ececec);
    background-image: -ms-linear-gradient(#f4f4f4, #ececec);
    background-image: -o-linear-gradient(#f4f4f4, #ececec);
    background-image: linear-gradient(#f4f4f4, #ececec);
  }

  .btn-github:hover,
  .btn-github:focus {
    border-color: #518cc6;
    border-bottom-color: #2a65a0;
    color: #fff;
    background-color: #599bdc;
    background-image: -webkit-gradient(
      linear,
      0 0,
      0 100%,
      from(#599bdc),
      to(#3072b3)
    );
    background-image: -webkit-linear-gradient(#599bdc, #3072b3);
    background-image: -moz-linear-gradient(#599bdc, #3072b3);
    background-image: -ms-linear-gradient(#599bdc, #3072b3);
    background-image: -o-linear-gradient(#599bdc, #3072b3);
    background-image: linear-gradient(#599bdc, #3072b3);
  }

  .btn-github:active {
    border-color: #2a65a0;
    border-bottom-color: #518cc6;
    color: #fff;
    background: #3072b3;
    background: -webkit-gradient(
      linear,
      0 0,
      0 100%,
      from(#3072b3),
      to(#599bdc)
    );
    background: -webkit-linear-gradient(#3072b3, #599bdc);
    background: -moz-linear-gradient(#3072b3, #599bdc);
    background: -ms-linear-gradient(#3072b3, #599bdc);
    background: -o-linear-gradient(#3072b3, #599bdc);
    background: linear-gradient(#3072b3, #599bdc);
  }

  /*
  * Icon
  */
  .btn-github:before {
    margin: 0 0.6em 0 -0.6em;
    background-position: -44px 0;
  }

  .btn-github:hover:before,
  .btn-github:focus:before,
  .btn-github:active:before {
    background-position: -66px 0;
  }

  .btn-github.large:before {
    background-position: -72px -22px;
  }

  .btn-github.large:hover:before,
  .btn-github.large:focus:before,
  .btn-github.large:active:before {
    background-position: -108px -22px;
  }
`;
